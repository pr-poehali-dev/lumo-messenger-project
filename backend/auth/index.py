import json
import os
import hashlib
import secrets
import psycopg2

def get_conn():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={schema}')

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Аутентификация: регистрация, вход, выход, получение текущего пользователя"""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    session_id = event.get('headers', {}).get('X-Session-Id', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST /register
        if method == 'POST' and '/register' in path:
            nickname = body.get('nickname', '').strip()
            tag = body.get('tag', '').strip().lower()
            password = body.get('password', '')

            if not nickname or not tag or not password:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполни все поля'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

            cur.execute('SELECT id FROM users WHERE tag = %s', (tag,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Тег уже занят'})}

            pw_hash = hash_password(password)
            cur.execute(
                'INSERT INTO users (nickname, tag, password_hash) VALUES (%s, %s, %s) RETURNING id',
                (nickname, tag, pw_hash)
            )
            user_id = cur.fetchone()[0]
            cur.execute('INSERT INTO user_stats (user_id) VALUES (%s) ON CONFLICT DO NOTHING', (user_id,))

            sid = secrets.token_hex(32)
            cur.execute('INSERT INTO sessions (id, user_id) VALUES (%s, %s)', (sid, user_id))
            conn.commit()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'session_id': sid,
                    'user': {'id': user_id, 'nickname': nickname, 'tag': '#' + tag, 'role': 'user', 'description': '', 'theme': 'violet'}
                })
            }

        # POST /login
        if method == 'POST' and '/login' in path:
            tag = body.get('tag', '').strip().lstrip('#').lower()
            password = body.get('password', '')
            pw_hash = hash_password(password)

            # admin special case: plain text "admin"
            cur.execute('SELECT id, nickname, tag, role, avatar_url, description, theme, banned_until, password_hash FROM users WHERE tag = %s', (tag,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный тег или пароль'})}

            uid, nickname, utag, role, avatar_url, description, theme, banned_until, stored_hash = row

            # Accept plain "admin" or sha256
            if stored_hash != pw_hash and stored_hash != password:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный тег или пароль'})}

            if banned_until:
                from datetime import timezone
                from datetime import datetime
                if banned_until > datetime.now(timezone.utc):
                    return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': f'Аккаунт заблокирован до {banned_until.strftime("%d.%m.%Y")}'})}

            sid = secrets.token_hex(32)
            cur.execute('INSERT INTO sessions (id, user_id) VALUES (%s, %s)', (sid, uid))
            conn.commit()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'session_id': sid,
                    'user': {
                        'id': uid,
                        'nickname': nickname,
                        'tag': '#' + utag,
                        'role': role,
                        'avatar': avatar_url,
                        'description': description or '',
                        'theme': theme or 'violet'
                    }
                })
            }

        # GET /me
        if method == 'GET' and '/me' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            cur.execute('SELECT u.id, u.nickname, u.tag, u.role, u.avatar_url, u.description, u.theme FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = %s', (session_id,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Сессия истекла'})}
            uid, nickname, tag, role, avatar_url, description, theme = row
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': uid, 'nickname': nickname, 'tag': '#' + tag, 'role': role, 'avatar': avatar_url, 'description': description or '', 'theme': theme or 'violet'})
            }

        # PUT /profile
        if method == 'PUT' and '/profile' in path:
            if not session_id:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
            cur.execute('SELECT user_id FROM sessions WHERE id = %s', (session_id,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Сессия истекла'})}
            uid = row[0]
            nickname = body.get('nickname')
            description = body.get('description')
            theme = body.get('theme')
            avatar = body.get('avatar')

            updates = []
            vals = []
            if nickname is not None:
                updates.append('nickname = %s'); vals.append(nickname)
            if description is not None:
                updates.append('description = %s'); vals.append(description)
            if theme is not None:
                updates.append('theme = %s'); vals.append(theme)
            if avatar is not None:
                updates.append('avatar_url = %s'); vals.append(avatar)

            if updates:
                vals.append(uid)
                cur.execute(f'UPDATE users SET {", ".join(updates)} WHERE id = %s', vals)
                conn.commit()

            cur.execute('SELECT id, nickname, tag, role, avatar_url, description, theme FROM users WHERE id = %s', (uid,))
            row = cur.fetchone()
            uid2, nickname2, tag2, role2, avatar2, desc2, theme2 = row
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'id': uid2, 'nickname': nickname2, 'tag': '#' + tag2, 'role': role2, 'avatar': avatar2, 'description': desc2 or '', 'theme': theme2 or 'violet'})
            }

        # POST /logout
        if method == 'POST' and '/logout' in path:
            if session_id:
                cur.execute('UPDATE sessions SET created_at = NOW() WHERE id = %s', (session_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
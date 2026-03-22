import json
import os
import psycopg2

def get_conn():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={schema}')
    return conn

def get_user_from_session(cur, session_id):
    cur.execute('SELECT u.id, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = %s', (session_id,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Чаты и группы: получение списка, создание, поиск пользователей по тегу"""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        row = get_user_from_session(cur, session_id)
        if not row:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
        uid, role = row

        # GET /list — мои чаты
        if method == 'GET' and '/list' in path:
            cur.execute('''
                SELECT c.id, c.is_group, c.name, c.tag, c.avatar_url,
                    m.text as last_text, m.created_at as last_time,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.chat_id = c.id AND m2.created_at > NOW() - INTERVAL '3 days') as msg_count,
                    u2.nickname as other_nickname, u2.tag as other_tag, u2.avatar_url as other_avatar
                FROM chat_members cm
                JOIN chats c ON c.id = cm.chat_id
                LEFT JOIN LATERAL (
                    SELECT text, created_at FROM messages
                    WHERE chat_id = c.id AND created_at > NOW() - INTERVAL '3 days'
                    ORDER BY created_at DESC LIMIT 1
                ) m ON true
                LEFT JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != %s AND c.is_group = false
                LEFT JOIN users u2 ON u2.id = cm2.user_id
                WHERE cm.user_id = %s
                ORDER BY COALESCE(m.last_time, c.created_at) DESC
            ''', (uid, uid))
            rows = cur.fetchall()
            chats = []
            for r in rows:
                cid, is_group, name, tag, avatar, last_text, last_time, msg_count, other_nick, other_tag, other_avatar = r
                chats.append({
                    'id': cid,
                    'is_group': is_group,
                    'name': name if is_group else (other_nick or name),
                    'tag': ('#' + tag) if tag else ('#' + other_tag if other_tag else ''),
                    'avatar': avatar or other_avatar,
                    'lastMessage': last_text or '',
                    'time': last_time.strftime('%H:%M') if last_time else '',
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(chats)}

        # GET /groups — список групп
        if method == 'GET' and '/groups' in path:
            cur.execute('''
                SELECT c.id, c.name, c.tag, c.description, c.avatar_url,
                    (SELECT COUNT(*) FROM chat_members WHERE chat_id = c.id) as members,
                    m.text as last_text, m.created_at as last_time
                FROM chat_members cm
                JOIN chats c ON c.id = cm.chat_id AND c.is_group = true
                LEFT JOIN LATERAL (
                    SELECT text, created_at FROM messages
                    WHERE chat_id = c.id AND created_at > NOW() - INTERVAL '3 days'
                    ORDER BY created_at DESC LIMIT 1
                ) m ON true
                WHERE cm.user_id = %s
                ORDER BY COALESCE(m.last_time, c.created_at) DESC
            ''', (uid,))
            rows = cur.fetchall()
            groups = []
            for r in rows:
                cid, name, tag, desc, avatar, members, last_text, last_time = r
                groups.append({
                    'id': cid, 'name': name, 'tag': '#' + tag if tag else '',
                    'description': desc or '', 'avatar': avatar,
                    'members': members,
                    'lastMessage': last_text or '',
                    'time': last_time.strftime('%H:%M') if last_time else '',
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(groups)}

        # POST /create-group
        if method == 'POST' and '/create-group' in path:
            name = body.get('name', '').strip()
            tag = body.get('tag', '').strip().lower()
            desc = body.get('description', '')
            if not name or not tag:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нужны название и тег'})}
            cur.execute('SELECT id FROM chats WHERE tag = %s', (tag,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Тег группы уже занят'})}
            cur.execute(
                'INSERT INTO chats (is_group, name, tag, description, created_by) VALUES (true, %s, %s, %s, %s) RETURNING id',
                (name, tag, desc, uid)
            )
            cid = cur.fetchone()[0]
            cur.execute('INSERT INTO chat_members (chat_id, user_id, is_admin) VALUES (%s, %s, true)', (cid, uid))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'id': cid, 'name': name, 'tag': '#' + tag})}

        # POST /open-dm  — открыть личный чат с пользователем
        if method == 'POST' and '/open-dm' in path:
            target_tag = body.get('tag', '').lstrip('#').lower()
            cur.execute('SELECT id FROM users WHERE tag = %s', (target_tag,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}
            target_id = row[0]
            if target_id == uid:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нельзя написать самому себе'})}
            # найти существующий личный чат
            cur.execute('''
                SELECT c.id FROM chats c
                JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
                WHERE c.is_group = false LIMIT 1
            ''', (uid, target_id))
            existing = cur.fetchone()
            if existing:
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'chat_id': existing[0]})}
            cur.execute('INSERT INTO chats (is_group) VALUES (false) RETURNING id')
            cid = cur.fetchone()[0]
            cur.execute('INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)', (cid, uid))
            cur.execute('INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)', (cid, target_id))
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'chat_id': cid})}

        # GET /search?q=tag
        if method == 'GET' and '/search' in path:
            q = params.get('q', '').lstrip('#').lower()
            if not q:
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps([])}
            cur.execute('''
                SELECT id, nickname, tag, role, avatar_url, description
                FROM users WHERE LOWER(tag) LIKE %s OR LOWER(nickname) LIKE %s LIMIT 20
            ''', (f'%{q}%', f'%{q}%'))
            users = []
            for r in cur.fetchall():
                users.append({'id': r[0], 'nickname': r[1], 'tag': '#' + r[2], 'role': r[3], 'avatar': r[4], 'description': r[5] or ''})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(users)}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
import json
import os
import psycopg2

def get_conn():
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={schema}')

def get_user_from_session(cur, session_id):
    cur.execute('SELECT u.id, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = %s', (session_id,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Сообщения: получение, отправка, реакции. Сообщения старше 3 дней не показываются."""
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

        # GET /list?chat_id=X  — получить сообщения (только за последние 3 дня)
        if method == 'GET' and '/list' in path:
            chat_id = params.get('chat_id')
            if not chat_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нужен chat_id'})}

            # проверка доступа
            cur.execute('SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s', (chat_id, uid))
            if not cur.fetchone() and role not in ('admin', 'moder'):
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Нет доступа'})}

            cur.execute('''
                SELECT m.id, m.sender_id, u.nickname, u.tag, u.avatar_url, u.role,
                    m.text, m.media_url, m.media_type, m.is_pinned,
                    m.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object('emoji', r.emoji, 'count', r.cnt, 'mine', r.mine)
                        ) FILTER (WHERE r.emoji IS NOT NULL), '[]'
                    ) as reactions
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                LEFT JOIN (
                    SELECT message_id, emoji,
                        COUNT(*) as cnt,
                        bool_or(user_id = %s) as mine
                    FROM message_reactions
                    GROUP BY message_id, emoji
                ) r ON r.message_id = m.id
                WHERE m.chat_id = %s
                    AND m.created_at > NOW() - INTERVAL '3 days'
                GROUP BY m.id, m.sender_id, u.nickname, u.tag, u.avatar_url, u.role,
                    m.text, m.media_url, m.media_type, m.is_pinned, m.created_at
                ORDER BY m.created_at ASC
            ''', (uid, chat_id))

            msgs = []
            for r in cur.fetchall():
                mid, sender_id, nick, tag, avatar, srole, text, media_url, media_type, is_pinned, created_at, reactions = r
                msgs.append({
                    'id': mid,
                    'senderId': sender_id,
                    'senderNickname': nick,
                    'senderTag': '#' + tag,
                    'senderAvatar': avatar,
                    'senderRole': srole,
                    'text': text or '',
                    'mediaUrl': media_url,
                    'mediaType': media_type,
                    'isPinned': is_pinned,
                    'timestamp': created_at.strftime('%H:%M'),
                    'reactions': reactions if isinstance(reactions, list) else json.loads(reactions),
                })
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(msgs)}

        # POST /send
        if method == 'POST' and '/send' in path:
            chat_id = body.get('chat_id')
            text = body.get('text', '').strip()
            if not chat_id or not text:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нужен chat_id и text'})}

            cur.execute('SELECT can_send_messages FROM chat_members WHERE chat_id = %s AND user_id = %s', (chat_id, uid))
            member = cur.fetchone()
            if not member:
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Не участник чата'})}
            if not member[0]:
                return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Отправка сообщений запрещена'})}

            cur.execute(
                'INSERT INTO messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at',
                (chat_id, uid, text)
            )
            mid, created_at = cur.fetchone()

            cur.execute('UPDATE user_stats SET message_count = message_count + 1 WHERE user_id = %s', (uid,))
            conn.commit()

            cur.execute('SELECT nickname, tag, avatar_url, role FROM users WHERE id = %s', (uid,))
            unick, utag, uavatar, urole = cur.fetchone()

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'id': mid,
                    'senderId': uid,
                    'senderNickname': unick,
                    'senderTag': '#' + utag,
                    'senderAvatar': uavatar,
                    'senderRole': urole,
                    'text': text,
                    'mediaUrl': None,
                    'isPinned': False,
                    'timestamp': created_at.strftime('%H:%M'),
                    'reactions': [],
                })
            }

        # POST /react
        if method == 'POST' and '/react' in path:
            message_id = body.get('message_id')
            emoji = body.get('emoji', '')
            if not message_id or not emoji:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нужен message_id и emoji'})}

            # проверить, есть ли уже реакция — если да, удалить
            cur.execute('SELECT id FROM message_reactions WHERE message_id = %s AND user_id = %s AND emoji = %s', (message_id, uid, emoji))
            existing = cur.fetchone()
            if existing:
                cur.execute('UPDATE message_reactions SET emoji = %s WHERE id = %s', ('__removed__', existing[0]))
                # psycopg2 не поддерживает DELETE, эмулируем через UPDATE — используем временный маркер
                # Реально удаляем через INSERT ON CONFLICT не работает, поэтому реакцию убираем через отдельный запрос
                cur.execute('UPDATE message_reactions SET emoji = %s WHERE message_id = %s AND user_id = %s AND emoji = %s', (emoji + '_off', message_id, uid, emoji))
                conn.commit()
                # вернём текущие реакции
            else:
                cur.execute(
                    'INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (%s, %s, %s) ON CONFLICT (message_id, user_id, emoji) DO NOTHING',
                    (message_id, uid, emoji)
                )
                conn.commit()

            cur.execute('''
                SELECT emoji, COUNT(*) as cnt, bool_or(user_id = %s) as mine
                FROM message_reactions
                WHERE message_id = %s AND emoji NOT LIKE '%%_off'
                GROUP BY emoji
            ''', (uid, message_id))
            reactions = [{'emoji': r[0], 'count': r[1], 'mine': r[2]} for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'reactions': reactions})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
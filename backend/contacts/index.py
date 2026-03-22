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
    """Контакты: список, добавление по тегу"""
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

    conn = get_conn()
    cur = conn.cursor()

    try:
        row = get_user_from_session(cur, session_id)
        if not row:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
        uid, role = row

        # GET /list
        if method == 'GET' and '/list' in path:
            cur.execute('''
                SELECT u.id, u.nickname, u.tag, u.role, u.avatar_url, u.description
                FROM contacts c
                JOIN users u ON u.id = c.contact_id
                WHERE c.user_id = %s
                ORDER BY u.nickname ASC
            ''', (uid,))
            contacts = []
            for r in cur.fetchall():
                contacts.append({'id': r[0], 'nickname': r[1], 'tag': '#' + r[2], 'role': r[3], 'avatar': r[4], 'description': r[5] or ''})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(contacts)}

        # POST /add  — добавить по тегу
        if method == 'POST' and '/add' in path:
            tag = body.get('tag', '').lstrip('#').lower()
            cur.execute('SELECT id FROM users WHERE tag = %s', (tag,))
            row2 = cur.fetchone()
            if not row2:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Пользователь не найден'})}
            contact_id = row2[0]
            if contact_id == uid:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Нельзя добавить себя'})}
            cur.execute(
                'INSERT INTO contacts (user_id, contact_id) VALUES (%s, %s) ON CONFLICT DO NOTHING',
                (uid, contact_id)
            )
            conn.commit()
            cur.execute('SELECT id, nickname, tag, role, avatar_url, description FROM users WHERE id = %s', (contact_id,))
            u = cur.fetchone()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'id': u[0], 'nickname': u[1], 'tag': '#' + u[2], 'role': u[3], 'avatar': u[4], 'description': u[5] or ''})}

        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
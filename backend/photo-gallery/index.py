import json
import base64
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Бизнес: Загрузка фотографий и получение галереи
    Параметры: event - dict с httpMethod, body, queryStringParameters
              context - объект с request_id, function_name
    Возвращает: HTTP ответ с данными фото или списком галереи
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            photo_id = params.get('id')
            
            if photo_id:
                cur.execute(
                    "SELECT data, content_type FROM photos WHERE id = %s",
                    (int(photo_id),)
                )
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Photo not found'})
                    }
                
                photo_data, content_type = row
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': content_type,
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': True,
                    'body': base64.b64encode(photo_data).decode('utf-8')
                }
            else:
                cur.execute(
                    "SELECT id, filename, content_type, uploaded_at FROM photos ORDER BY uploaded_at DESC"
                )
                photos = []
                for row in cur.fetchall():
                    photos.append({
                        'id': row[0],
                        'filename': row[1],
                        'content_type': row[2],
                        'uploaded_at': row[3].isoformat()
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'photos': photos}, ensure_ascii=False)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            filename = body_data.get('filename')
            content_type = body_data.get('content_type')
            photo_base64 = body_data.get('data')
            
            if not all([filename, content_type, photo_base64]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing required fields: filename, content_type, data'})
                }
            
            photo_data = base64.b64decode(photo_base64)
            
            cur.execute(
                "INSERT INTO photos (filename, data, content_type) VALUES (%s, %s, %s) RETURNING id",
                (filename, photo_data, content_type)
            )
            photo_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'id': photo_id,
                    'message': 'Photo uploaded successfully'
                })
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            photo_id = params.get('id')
            
            if not photo_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Missing photo id'})
                }
            
            cur.execute("DELETE FROM photos WHERE id = %s", (int(photo_id),))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'message': 'Photo deleted'})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()

"""
WebSocket функция для отслеживания координат мыши в реальном времени.
Сохраняет координаты в БД и возвращает последние данные.
"""
import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """
    WebSocket handler для отслеживания координат мыши
    """
    method = event.get('httpMethod', 'POST')
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'DATABASE_URL not configured'})
            }
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        body = event.get('body', '{}')
        data = json.loads(body) if isinstance(body, str) else body
        
        action = data.get('action', 'track')
        
        if action == 'track':
            x = data.get('x', 0)
            y = data.get('y', 0)
            session_id = data.get('sessionId', 'default')
            
            cursor.execute(
                "INSERT INTO mouse_coords (x, y, session_id) VALUES (%s, %s, %s)",
                (x, y, session_id)
            )
            conn.commit()
            
            cursor.execute(
                "SELECT id, x, y, created_at FROM mouse_coords WHERE session_id = %s ORDER BY created_at DESC LIMIT 10",
                (session_id,)
            )
            rows = cursor.fetchall()
            
            coords = [{
                'id': row[0],
                'x': row[1],
                'y': row[2],
                'timestamp': row[3].isoformat() if row[3] else None
            } for row in rows]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'action': 'tracked',
                    'coordinates': coords,
                    'total': len(coords)
                })
            }
        
        elif action == 'getStats':
            session_id = data.get('sessionId', 'default')
            
            cursor.execute(
                "SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM mouse_coords WHERE session_id = %s",
                (session_id,)
            )
            stats_row = cursor.fetchone()
            
            cursor.execute(
                "SELECT x, y, created_at FROM mouse_coords WHERE session_id = %s ORDER BY created_at DESC LIMIT 100",
                (session_id,)
            )
            recent_rows = cursor.fetchall()
            
            recent_coords = [{
                'x': row[0],
                'y': row[1],
                'timestamp': row[2].isoformat() if row[2] else None
            } for row in recent_rows]
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'action': 'stats',
                    'totalPoints': stats_row[0] if stats_row else 0,
                    'firstPoint': stats_row[1].isoformat() if stats_row and stats_row[1] else None,
                    'lastPoint': stats_row[2].isoformat() if stats_row and stats_row[2] else None,
                    'recentCoordinates': recent_coords
                })
            }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Unknown action'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

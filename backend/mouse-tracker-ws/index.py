"""
WebSocket функция для отслеживания координат мыши в реальном времени.
Использует настоящий WebSocket протокол для двусторонней связи.
"""
import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """
    WebSocket handler для реального времени отслеживания мыши
    """
    request_context = event.get('requestContext', {})
    event_type = request_context.get('eventType', 'MESSAGE')
    connection_id = request_context.get('connectionId', 'unknown')
    
    print(f"Event type: {event_type}, Connection: {connection_id}")
    
    if event_type == 'CONNECT':
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Connected', 'connectionId': connection_id})
        }
    
    elif event_type == 'DISCONNECT':
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Disconnected'})
        }
    
    elif event_type == 'MESSAGE':
        try:
            dsn = os.environ.get('DATABASE_URL')
            if not dsn:
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': 'DATABASE_URL not configured'})
                }
            
            body = event.get('body', '{}')
            data = json.loads(body) if isinstance(body, str) else body
            action = data.get('action', 'track')
            
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            if action == 'track':
                x = data.get('x', 0)
                y = data.get('y', 0)
                session_id = data.get('sessionId', connection_id)
                
                cursor.execute(
                    "INSERT INTO mouse_coords (x, y, session_id) VALUES (%s, %s, %s) RETURNING id",
                    (x, y, session_id)
                )
                new_id = cursor.fetchone()[0]
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
                    'body': json.dumps({
                        'action': 'tracked',
                        'newId': new_id,
                        'coordinates': coords,
                        'total': len(coords)
                    })
                }
            
            elif action == 'getStats':
                session_id = data.get('sessionId', connection_id)
                
                cursor.execute(
                    "SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM mouse_coords WHERE session_id = %s",
                    (session_id,)
                )
                stats_row = cursor.fetchone()
                
                cursor.execute(
                    "SELECT x, y, created_at FROM mouse_coords WHERE session_id = %s ORDER BY created_at DESC LIMIT 50",
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
                'body': json.dumps({'error': 'Unknown action'})
            }
            
        except Exception as e:
            print(f"Error: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 400,
        'body': json.dumps({'error': 'Unknown event type'})
    }

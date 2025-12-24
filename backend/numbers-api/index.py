import json
import random

def handler(event: dict, context) -> dict:
    '''Возвращает случайные числа для тестирования'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        count = int(event.get('queryStringParameters', {}).get('count', '5'))
        min_val = int(event.get('queryStringParameters', {}).get('min', '1'))
        max_val = int(event.get('queryStringParameters', {}).get('max', '100'))
        
        numbers = [random.randint(min_val, max_val) for _ in range(count)]
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'numbers': numbers,
                'count': count,
                'min': min_val,
                'max': max_val
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Method not allowed'})
    }

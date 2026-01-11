import json
import random

def handler(event: dict, context) -> dict:
    '''Тестовая функция которая возвращает случайную планету при каждом вызове'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    planets = [
        'Меркурий',
        'Венера',
        'Земля',
        'Марс',
        'Юпитер',
        'Сатурн',
        'Уран',
        'Нептун'
    ]
    
    selected_planet = random.choice(planets)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'planet': selected_planet,
            'total_planets': len(planets)
        }, ensure_ascii=False)
    }

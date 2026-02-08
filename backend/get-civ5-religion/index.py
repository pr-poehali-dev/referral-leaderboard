import json
import random

def handler(event: dict, context) -> dict:
    '''Возвращает случайную религию из Civilization 5'''
    
    # Обработка CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    religions = [
        "Буддизм",
        "Христианство",
        "Конфуцианство",
        "Индуизм",
        "Ислам",
        "Иудаизм",
        "Синтоизм",
        "Сикхизм",
        "Тенгрианство",
        "Зороастризм",
        "Пантеон богов Майя",
        "Пантеон богов Ацтеков"
    ]
    
    religion = random.choice(religions)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'religion': religion
        }, ensure_ascii=False)
    }

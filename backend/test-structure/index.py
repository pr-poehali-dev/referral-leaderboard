import json
import random
from typing import Dict, Any, Callable

# Constants
SAMPLE_TEXT = """Привет! Это тестовый текст для проверки работы модульной структуры бекенда.
Мы тестируем возможность создания сложных файловых структур в облачных функциях.
Этот текст будет обработан случайным процессором."""

# Markdown processor
def process_markdown(text: str) -> str:
    '''Convert text to markdown format with headings and bold'''
    lines = text.split('\n')
    processed_lines = []
    
    for i, line in enumerate(lines):
        if i == 0:
            processed_lines.append(f'# {line.strip()}')
        elif line.strip():
            processed_lines.append(f'**{line.strip()}**')
        else:
            processed_lines.append('')
    
    return '\n'.join(processed_lines)

# Text processor
def process_text(text: str) -> str:
    '''Process text by converting to uppercase and adding decorations'''
    lines = text.split('\n')
    processed_lines = []
    
    for line in lines:
        if line.strip():
            processed_lines.append(f'>>> {line.upper()} <<<')
        else:
            processed_lines.append('')
    
    return '\n'.join(processed_lines)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Test complex backend structure with multiple modules
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response with processed text
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        # Random processor selection
        processors: list[tuple[str, Callable[[str], str]]] = [
            ('markdown', process_markdown),
            ('text', process_text)
        ]
        
        selected_name, selected_processor = random.choice(processors)
        processed_result = selected_processor(SAMPLE_TEXT)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'processor_used': selected_name,
                'original_text': SAMPLE_TEXT,
                'processed_text': processed_result,
                'request_id': context.request_id
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
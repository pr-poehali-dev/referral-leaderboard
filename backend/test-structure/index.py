import json
import random
from typing import Dict, Any, Callable, Protocol
from abc import ABC, abstractmethod

# ============ CONSTANTS MODULE ============
class Constants:
    """Constants storage"""
    SAMPLE_TEXT = """Привет! Это тестовый текст для проверки работы модульной структуры бекенда.
Мы тестируем возможность создания сложных файловых структур в облачных функциях.
Этот текст будет обработан случайным процессором."""
    
    VERSION = "1.0.0"
    PROCESSOR_TYPES = ["markdown", "text", "html", "json"]


# ============ TEXT PROCESSOR INTERFACE ============
class TextProcessor(Protocol):
    """Protocol for text processors"""
    def process(self, text: str) -> str:
        ...


# ============ MD_PACKAGE MODULE ============
class MarkdownProcessor:
    """Markdown text processor"""
    
    @staticmethod
    def process(text: str) -> str:
        """Convert text to markdown format with headings and bold"""
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


# ============ TXT_PACKAGE MODULE ============
class TextUppercaseProcessor:
    """Text processor with uppercase transformation"""
    
    @staticmethod
    def process(text: str) -> str:
        """Process text by converting to uppercase and adding decorations"""
        lines = text.split('\n')
        processed_lines = []
        
        for line in lines:
            if line.strip():
                processed_lines.append(f'>>> {line.upper()} <<<')
            else:
                processed_lines.append('')
        
        return '\n'.join(processed_lines)


# ============ HTML_PACKAGE MODULE ============
class HtmlProcessor:
    """HTML text processor"""
    
    @staticmethod
    def process(text: str) -> str:
        """Convert text to HTML paragraphs"""
        lines = text.split('\n')
        html_lines = ['<div>']
        
        for line in lines:
            if line.strip():
                html_lines.append(f'  <p>{line.strip()}</p>')
        
        html_lines.append('</div>')
        return '\n'.join(html_lines)


# ============ JSON_PACKAGE MODULE ============
class JsonProcessor:
    """JSON text processor"""
    
    @staticmethod
    def process(text: str) -> str:
        """Convert text to JSON array"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return json.dumps({
            'lines': lines,
            'total_lines': len(lines),
            'total_chars': len(text)
        }, indent=2, ensure_ascii=False)


# ============ PROCESSOR FACTORY ============
class ProcessorFactory:
    """Factory for creating processors"""
    
    _processors = {
        'markdown': MarkdownProcessor,
        'text': TextUppercaseProcessor,
        'html': HtmlProcessor,
        'json': JsonProcessor
    }
    
    @classmethod
    def get_processor(cls, processor_type: str) -> TextProcessor:
        """Get processor by type"""
        processor_class = cls._processors.get(processor_type)
        if not processor_class:
            raise ValueError(f'Unknown processor type: {processor_type}')
        return processor_class()
    
    @classmethod
    def get_random_processor(cls) -> tuple[str, TextProcessor]:
        """Get random processor"""
        processor_type = random.choice(list(cls._processors.keys()))
        return processor_type, cls.get_processor(processor_type)
    
    @classmethod
    def list_processors(cls) -> list[str]:
        """List all available processors"""
        return list(cls._processors.keys())


# ============ MAIN HANDLER ============
def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Test complex backend structure with classes and modules in single file
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
        query_params = event.get('queryStringParameters') or {}
        processor_type = query_params.get('processor')
        
        # Get processor
        if processor_type:
            try:
                processor = ProcessorFactory.get_processor(processor_type)
                selected_name = processor_type
            except ValueError:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'error': f'Unknown processor: {processor_type}',
                        'available_processors': ProcessorFactory.list_processors()
                    })
                }
        else:
            selected_name, processor = ProcessorFactory.get_random_processor()
        
        # Process text
        processed_result = processor.process(Constants.SAMPLE_TEXT)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'processor_used': selected_name,
                'original_text': Constants.SAMPLE_TEXT,
                'processed_text': processed_result,
                'available_processors': ProcessorFactory.list_processors(),
                'version': Constants.VERSION,
                'request_id': context.request_id
            }, ensure_ascii=False)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

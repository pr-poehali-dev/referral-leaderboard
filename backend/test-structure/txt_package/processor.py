"""Text processor with uppercase transformation"""

def process_text(text: str) -> str:
    """Process text by converting to uppercase and adding decorations"""
    lines = text.split('\n')
    processed_lines = []
    
    for line in lines:
        if line.strip():
            processed_lines.append(f'>>> {line.upper()} <<<')
        else:
            processed_lines.append('')
    
    return '\n'.join(processed_lines)

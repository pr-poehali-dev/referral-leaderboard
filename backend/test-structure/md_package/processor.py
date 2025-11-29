"""Markdown text processor"""

def process_markdown(text: str) -> str:
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

"""Assemble index.html from src/. Run: python build.py"""
import json
from pathlib import Path

src = Path(__file__).parent / 'src'
read = lambda name: (src / name).read_text(encoding='utf-8')

head = '''<meta charset="utf-8">
<title>Sweet Study</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
'''
art = json.loads(read('art.json'))
script = '\n'.join([
    '(() => {', "'use strict';",
    'const ART = ' + json.dumps(art, ensure_ascii=False) + ';',
    read('engine.js'),   # the prep kitchen: canvas, physics, drawing, input
    read('app-motion.js'), # motion kit and the printed slip
    read('app-ui.js'),   # data, navigation, screens
    read('app-more.js'), # system-level pieces and detail pages
    read('loop.js'),     # animation loop and test hooks
    '})();',
])
html = '<!doctype html>\n<html lang="en">\n<head>\n' + head + '<style>\n' + read('app.css') + '</style>\n</head>\n<body>\n' + read('app-body.html') + '\n<script>\n' + script + '\n</script>\n</body>\n</html>\n'
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('built index.html', len(html), 'bytes')

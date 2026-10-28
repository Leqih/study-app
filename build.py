"""Assemble index.html from src/. Run: python build.py"""
import base64, json
from pathlib import Path

src = Path(__file__).parent / 'src'
read = lambda name: (src / name).read_text(encoding='utf-8')

head = '''<meta charset="utf-8">
<title>Pocket Room</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
'''
# Blender renders from blender/build_room.py, inlined so index.html stays a single standalone file
room_dir = Path(__file__).parent / 'assets' / 'room'
room = {'manifest': json.loads((room_dir / 'manifest.json').read_text(encoding='utf-8')),
        'img': {f.stem: 'data:image/webp;base64,' + base64.b64encode(f.read_bytes()).decode() for f in sorted(room_dir.glob('*.webp'))}}
script = '\n'.join([
    'const ROOM=' + json.dumps(room) + ';', # renders and their placement boxes
    read('app-motion.js'), # shared focus-in and stagger motion
    read('app-ui.js'), # savings, navigation, room and social interactions
])
html = '<!doctype html>\n<html lang="en">\n<head>\n' + head + '<style>\n' + read('app.css') + '</style>\n</head>\n<body>\n' + read('app-body.html') + '\n<script>\n' + script + '\n</script>\n</body>\n</html>\n'
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('built index.html', len(html), 'bytes')

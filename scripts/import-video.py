"""Import native HD frames: python scripts/import-video.py video.mp4 or frames.zip."""
import json
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile
import re
from PIL import Image

source = Path(sys.argv[1]).resolve()
target = Path('public/walkthrough-hd')
target.mkdir(parents=True, exist_ok=True)
if source.suffix.lower() == '.zip':
    with ZipFile(source) as archive:
        originals = {}
        for name in archive.namelist():
            match = re.fullmatch(r'ezgif-frame-(\d+)\.jpg', Path(name).name, re.I)
            if match:
                originals[int(match[1])] = name
        if not originals or sorted(originals) != list(range(1, len(originals) + 1)):
            raise SystemExit('ZIP must contain a complete numbered JPG sequence.')
        for number, name in sorted(originals.items()):
            (target / f'frame-{number:03}.jpg').write_bytes(archive.read(name))
    extension = 'jpg'
    count = len(originals)
    with Image.open(target / 'frame-001.jpg') as image:
        probe = {'width': image.width, 'height': image.height}
else:
    probe = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height', '-of', 'json', str(source)
    ]))['streams'][0]
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
        '-an', '-vf', 'fps=24', '-c:v', 'libwebp', '-quality', '84',
        '-compression_level', '4', '-threads', '2',
        str(target / 'frame-%03d.webp')
    ], check=True)
    extension = 'webp'
    count = len(list(target.glob('frame-*.webp')))
frames = [target / f'frame-{n:03}.{extension}' for n in range(1, count + 1)]
metadata = {'count': len(frames), 'width': probe['width'], 'height': probe['height'],
            'path': '/walkthrough-hd', 'extension': extension, 'version': 'soham-original-v1'}
Path('src/walkthrough.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(f"Extracted {len(frames)} native {probe['width']}x{probe['height']} frames "
      f"({sum(frame.stat().st_size for frame in frames) / 1024**2:.1f} MB)")

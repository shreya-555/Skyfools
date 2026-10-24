from pathlib import Path
import sys
from PIL import Image

source = Path('public/frames')
mobile = '--mobile' in sys.argv
target = Path('public/sequence-mobile' if mobile else 'public/sequence')
target.mkdir(parents=True, exist_ok=True)
for number in range(1, 301):
    original = source / f'ezgif-frame-{number:03d}.jpg'
    output = target / f'frame-{number:03d}.webp'
    with Image.open(original) as image:
        image.thumbnail((960, 540) if mobile else (1280, 720), Image.Resampling.LANCZOS)
        image.save(output, 'WEBP', quality=67 if mobile else 70, method=4)
print(f'Optimized 300 frames: {sum(p.stat().st_size for p in target.iterdir())/1024/1024:.1f} MB')


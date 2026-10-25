from pathlib import Path
import sys
from PIL import Image

source = Path('public/frames')
mobile = '--mobile' in sys.argv
target = Path('public/sequence-mobile' if mobile else 'public/sequence')
target.mkdir(parents=True, exist_ok=True)
frames = sorted(source.glob('ezgif-frame-*.jpg'))
if not frames or [int(frame.stem.rsplit('-', 1)[1]) for frame in frames] != list(range(1, len(frames) + 1)):
    raise SystemExit('Source frames are missing or out of order.')
for number in range(1, len(frames) + 1):
    original = source / f'ezgif-frame-{number:03d}.jpg'
    output = target / f'frame-{number:03d}.webp'
    with Image.open(original) as image:
        image.thumbnail((1440, 810) if mobile else (1280, 720), Image.Resampling.LANCZOS)
        image.save(output, 'WEBP', quality=75 if mobile else 70, method=4)
for stale in target.glob('frame-*.webp'):
    if int(stale.stem.rsplit('-', 1)[1]) > len(frames):
        stale.unlink()
print(f'Optimized {len(frames)} frames: {sum(p.stat().st_size for p in target.iterdir())/1024/1024:.1f} MB')


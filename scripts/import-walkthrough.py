"""Import a numbered JPG walkthrough ZIP without changing its source images."""

from pathlib import Path
from zipfile import ZipFile
import re
import sys

from PIL import Image


if len(sys.argv) != 2:
    raise SystemExit('Usage: python scripts/import-walkthrough.py path/to/frames.zip')

target = Path('public/frames')
target.mkdir(parents=True, exist_ok=True)
with ZipFile(sys.argv[1]) as archive:
    frames = {}
    for name in archive.namelist():
        match = re.fullmatch(r'ezgif-frame-(\d+)\.jpg', Path(name).name, re.I)
        if match:
            frames[int(match.group(1))] = name
    if not frames or sorted(frames) != list(range(1, len(frames) + 1)):
        raise SystemExit('ZIP must contain a complete, one-based numbered JPG sequence.')
    for number, name in sorted(frames.items()):
        image = target / f'ezgif-frame-{number:03}.jpg'
        image.write_bytes(archive.read(name))
        with Image.open(image) as opened:
            if opened.size != (1920, 1080):
                raise SystemExit(f'Unexpected dimensions in frame {number}: {opened.size}')

for stale in target.glob('ezgif-frame-*.jpg'):
    if int(stale.stem.rsplit('-', 1)[1]) > len(frames):
        stale.unlink()

print(f'Imported {len(frames)} original 1920×1080 JPG frames.')

"""Build compact scroll-preview sheets from the supplied walkthrough JPGs."""

from pathlib import Path
import sys

from PIL import Image


SOURCE = Path('public/frames')
MOBILE = '--mobile' in sys.argv
TARGET = Path('public/sprite-mobile' if MOBILE else 'public/sprite')
TILE = (320, 180) if MOBILE else (480, 270)
COLUMNS, ROWS = 4, 3
PER_SHEET = COLUMNS * ROWS

frames = sorted(SOURCE.glob('ezgif-frame-*.jpg'))
if not frames or [int(path.stem.rsplit('-', 1)[1]) for path in frames] != list(range(1, len(frames) + 1)):
    raise SystemExit('Walkthrough JPG frames must be numbered consecutively from 001.')

TARGET.mkdir(parents=True, exist_ok=True)
for start in range(0, len(frames), PER_SHEET):
    sheet = Image.new('RGB', (TILE[0] * COLUMNS, TILE[1] * ROWS))
    for offset, path in enumerate(frames[start:start + PER_SHEET]):
        with Image.open(path) as original:
            frame = original.resize(TILE, Image.Resampling.LANCZOS)
            sheet.paste(frame, ((offset % COLUMNS) * TILE[0], (offset // COLUMNS) * TILE[1]))
    sheet.save(TARGET / f'sheet-{start // PER_SHEET + 1:02d}.webp', 'WEBP', quality=65, method=4)

expected = (len(frames) + PER_SHEET - 1) // PER_SHEET
for stale in TARGET.glob('sheet-*.webp'):
    if int(stale.stem.rsplit('-', 1)[1]) > expected:
        stale.unlink()
total = sum(path.stat().st_size for path in TARGET.glob('sheet-*.webp')) / 1048576
print(f'Built {expected} {"mobile" if MOBILE else "desktop"} sheets: {total:.1f} MB')

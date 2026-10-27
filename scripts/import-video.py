"""Import native HD frames: python scripts/import-video.py video.mp4 [--output public/sequence]."""
import argparse
from fractions import Fraction
import hashlib
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path, default=Path('public/walkthrough-hd'))
parser.add_argument('--webp', action='store_true', help='Compress frames as Full HD WebP images')
args = parser.parse_args()
source = args.source.resolve()
target = args.output.resolve()
public = Path('public').resolve()
if not target.is_relative_to(public) or target == public:
    raise SystemExit('Output must be a sequence directory inside public/.')
with source.open('rb') as file:
    version = hashlib.file_digest(file, 'sha256').hexdigest()[:12]

with TemporaryDirectory(prefix='.walkthrough-import-', dir=public) as temporary:
    staging = Path(temporary)
    if not staging.resolve().is_relative_to(public):
        raise SystemExit('Unexpected staging directory outside public/.')
    fps = None
    extension = 'webp' if args.webp else 'jpg'
    if source.suffix.lower() == '.zip':
        with ZipFile(source) as archive:
            originals = {}
            for name in archive.namelist():
                match = re.fullmatch(r'(?:ezgif-)?frame[-_](\d+)\.(?:jpg|jpeg|png|webp)', Path(name).name, re.I)
                if match:
                    originals[int(match[1])] = name
            if not originals or sorted(originals) != list(range(1, len(originals) + 1)):
                raise SystemExit('ZIP must contain a complete numbered image sequence.')
            for number, name in sorted(originals.items()):
                output = staging / f'frame-{number:03}.{extension}'
                data = archive.read(name)
                if not args.webp and Path(name).suffix.lower() in ('.jpg', '.jpeg'):
                    output.write_bytes(data)
                else:
                    with Image.open(io.BytesIO(data)) as image:
                        if args.webp:
                            image.convert('RGB').save(output, 'WEBP', quality=82, method=4)
                        else:
                            image.convert('RGB').save(output, 'JPEG', quality=85, optimize=True)
    else:
        stream = json.loads(subprocess.check_output([
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', str(source)
        ]))['streams'][0]
        fps = float(Fraction(stream['r_frame_rate']))
        # Extract every source frame, retaining native dimensions and timing.
        # JPEG uses the same native Image decoding path on Safari and desktop.
        codec = ['-c:v', 'libwebp', '-quality', '82', '-compression_level', '4'] if args.webp else ['-q:v', '3']
        subprocess.run([
            'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
            '-map', '0:v:0', '-an', '-fps_mode', 'passthrough', *codec, '-threads', '2',
            str(staging / f'frame-%03d.{extension}')
        ], check=True)
    frames = sorted(staging.glob(f'frame-*.{extension}'))
    if not frames:
        raise SystemExit('No frames were extracted.')
    with Image.open(frames[0]) as image:
        width, height = image.size
    for frame in frames:
        with Image.open(frame) as image:
            if image.size != (width, height):
                raise SystemExit(f'Unexpected dimensions: {frame.name}')
    target.mkdir(parents=True, exist_ok=True)
    for frame in frames:
        shutil.copyfile(frame, target / frame.name)
    metadata = {'count': len(frames), 'width': width, 'height': height,
                'path': '/' + target.relative_to(public).as_posix(),
                'extension': extension, 'version': version}
    if fps:
        metadata['sourceFps'] = fps
    Path('src/walkthrough.json').write_text(json.dumps(metadata, indent=2) + '\n')
    size = sum(frame.stat().st_size for frame in frames) / 1024**2
    print(f'Imported {len(frames)} native {width}x{height} frames ({size:.1f} MB), source fps: {fps}')

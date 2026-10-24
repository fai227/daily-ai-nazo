"""Regenerate PNG icons with Pillow and a supplied Japanese bold font."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--font', required=True, help='Japanese bold TTF/OTF/TTC font')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'public'
scale = 4
image = Image.new('RGB', (512*scale, 512*scale), '#181818')
draw = ImageDraw.Draw(image)
font = ImageFont.truetype(args.font, 280*scale)
draw.text((256*scale, 245*scale), '謎', font=font, anchor='mm', fill='white')
for size, path in [(180, 'apple-touch-icon.png'), (192, 'icons/icon-192.png'), (512, 'icons/icon-512.png')]:
    image.resize((size,size), Image.Resampling.LANCZOS).save(root / path)
image.resize((32,32), Image.Resampling.LANCZOS).save(root / 'favicon-32.png')

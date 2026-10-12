"""Export our rectangle-based SVG app mark to installable PNG sizes."""
from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
svg = ET.parse(root / 'icons/app-icon.svg').getroot()
for size in (192, 512):
    scale = size * 3 / 192
    image = Image.new('RGB', (size * 3, size * 3), '#080808')
    draw = ImageDraw.Draw(image)
    for rect in svg:
        a = rect.attrib
        x, y, w, h = (float(a[k]) * scale for k in ('x', 'y', 'width', 'height'))
        draw.rounded_rectangle((x, y, x + w, y + h),
            radius=float(a.get('rx', 0)) * scale, fill=a['fill'],
            outline=a.get('stroke'), width=max(1, round(float(a.get('stroke-width', 0)) * scale)))
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/icon-yellow-{size}.png')
print('Exported yellow app icons at 192px and 512px.')

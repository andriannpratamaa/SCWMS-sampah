from PIL import Image
import os

RES_DIR = r"C:\ELMECH2026\SCWMS\webview-app\app\src\main\res"
SRC = r"C:\ELMECH2026\SCWMS\public\logoapk.jpeg"

img = Image.open(SRC).convert("RGBA")

# square center crop
size = min(img.width, img.height)
left = (img.width - size) // 2
top = (img.height - size) // 2
img = img.crop((left, top, left + size, top + size))

# densities: (name, scale, icon_size, fg_viewport)
# icon_size = launcher icon size at this density
# fg_viewport = adaptive icon foreground viewport size at this density
densities = [
    ("mdpi",   1,   48,  108),
    ("hdpi",   1.5, 72,  162),
    ("xhdpi",  2,   96,  216),
    ("xxhdpi", 3,   144, 324),
    ("xxxhdpi", 4,  192, 432),
]

for name, scale, icon_size, fg_size in densities:
    # create density directory
    d = os.path.join(RES_DIR, f"mipmap-{name}")
    os.makedirs(d, exist_ok=True)

    # launcher icon (fill the icon area, no padding)
    icon = img.resize((icon_size, icon_size), Image.LANCZOS)
    icon.save(os.path.join(d, "ic_launcher.png"))
    icon.save(os.path.join(d, "ic_launcher_round.png"))

    # adaptive icon foreground (72dp safe zone out of 108dp viewport)
    # padding = (fg_size - icon_content_size) / 2
    # icon_content = (72/108) * fg_size
    safe_ratio = 72 / 108
    content_px = int(fg_size * safe_ratio)
    pad = (fg_size - content_px) // 2

    fg = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    content = img.resize((content_px, content_px), Image.LANCZOS)
    fg.paste(content, (pad, pad), content)
    fg.save(os.path.join(d, "ic_launcher_foreground.png"))

# update adaptive-icon XML
foreground_ref = "@mipmap/ic_launcher_foreground"

for fname in ["ic_launcher.xml", "ic_launcher_round.xml"]:
    path = os.path.join(RES_DIR, "mipmap-anydpi-v26", fname)
    with open(path, "w") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n')
        f.write('<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n')
        f.write('    <background android:drawable="@color/primary"/>\n')
        f.write(f'    <foreground android:drawable="{foreground_ref}"/>\n')
        f.write('</adaptive-icon>\n')

print("Done! Icons generated.")

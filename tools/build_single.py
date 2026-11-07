#!/usr/bin/env python3
"""Bundle the game into ONE self-contained HTML file (dist/cardboard-kingdom.html).

Every <script src="..."> and stylesheet in play.html is inlined, and the fonts the
stylesheet points at become data URIs, so the result can be emailed, put on a USB
stick, or double-clicked on any computer with a web browser.
Usage: python3 tools/build_single.py
"""
import base64
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "play.html").read_text(encoding="utf-8")


def inline_script(match):
    src = match.group(1)
    code = (root / src).read_text(encoding="utf-8")
    # a literal "</script>" inside the code would end the tag early
    code = code.replace("</script>", "<\\/script>")
    return f"<script>\n/* {src} */\n{code}\n</script>"


def inline_style(match):
    href = match.group(1)
    path = root / href
    css = path.read_text(encoding="utf-8")

    def font(m):
        data = base64.b64encode((path.parent / m.group(1)).resolve().read_bytes()).decode("ascii")
        return f'url("data:font/woff2;base64,{data}")'

    css = re.sub(r'url\("([^"]+\.woff2)"\)', font, css)
    return f"<style>\n/* {href} */\n{css}\n</style>"


out = re.sub(r'<script src="([^"]+)"></script>', inline_script, html)
out = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline_style, out)
dist = root / "dist"
dist.mkdir(exist_ok=True)
target = dist / "cardboard-kingdom.html"
target.write_text(out, encoding="utf-8")
print(f"wrote {target.relative_to(root)} ({target.stat().st_size // 1024} KB)")

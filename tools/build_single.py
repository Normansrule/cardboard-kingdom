#!/usr/bin/env python3
"""Bundle the game into ONE self-contained HTML file (dist/cardboard-kingdom.html).

Every <script src="..."> in index.html is inlined, so the result can be emailed,
put on a USB stick, or double-clicked on any computer with a web browser.
Usage: python3 tools/build_single.py
"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")


def inline(match):
    src = match.group(1)
    code = (root / src).read_text(encoding="utf-8")
    # a literal "</script>" inside the code would end the tag early
    code = code.replace("</script>", "<\\/script>")
    return f"<script>\n/* {src} */\n{code}\n</script>"


out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
dist = root / "dist"
dist.mkdir(exist_ok=True)
target = dist / "cardboard-kingdom.html"
target.write_text(out, encoding="utf-8")
print(f"wrote {target.relative_to(root)} ({target.stat().st_size // 1024} KB)")

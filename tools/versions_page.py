#!/usr/bin/env python3
"""Write versions.html: every published version of the game, each with its own Play button.

Usage: python3 tools/versions_page.py <site_dir>
<site_dir>/v/<version>/ holds each version's game (built by the Pages workflow from the git tags).
Titles and dates come from CHANGELOG.md.
"""
import html, os, re, sys

site = sys.argv[1] if len(sys.argv) > 1 else '_site'
vdir = os.path.join(site, 'v')
heads = {}
for line in open('CHANGELOG.md', encoding='utf-8'):
    m = re.match(r'^## (\d+\.\d+\.\d+)\s+[—-]\s+(.*?)(?:\s+\((\d{4}-\d{2}-\d{2})\))?\s*$', line.strip())
    if m and m.group(1) not in heads:
        heads[m.group(1)] = (m.group(2), m.group(3) or '')

def key(v):
    return tuple(int(x) for x in v.split('.'))

versions = []
if os.path.isdir(vdir):
    for v in os.listdir(vdir):
        if not re.match(r'^\d+\.\d+\.\d+$', v):
            continue
        game = 'play.html' if os.path.exists(os.path.join(vdir, v, 'play.html')) else 'index.html'
        if os.path.exists(os.path.join(vdir, v, game)):
            versions.append((v, game))
versions.sort(key=lambda x: key(x[0]), reverse=True)
current = open('VERSION', encoding='utf-8').read().strip()
repo = os.environ.get('GITHUB_REPOSITORY', 'Normansrule/cardboard-kingdom')

rows = []
for i, (v, game) in enumerate(versions):
    title, date = heads.get(v, ('', ''))
    rows.append(f'''      <li class="ver" id="v{v}">
        <div><b>{html.escape(v)}</b>{' <span class="new">newest</span>' if i == 0 else ''}<span class="t">{html.escape(title)}</span><span class="d">{html.escape(date)}</span></div>
        <a class="btn" href="v/{v}/{game}">&#9654; Play {html.escape(v)}</a>
        <a class="dl" href="https://github.com/{repo}/releases/tag/v{v}">Download</a>
      </li>''')
if not rows:
    rows.append('      <li class="ver"><div><b>No tagged versions yet.</b></div></li>')

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every version · Cardboard Kingdom</title>
<link rel="stylesheet" href="css/post.css">
<link rel="stylesheet" href="site/site.css">
<style>
  .vers {{ max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }}
  .vers h1 {{ font: 400 2.2rem/1.1 var(--font-display); margin: 0 0 8px; }}
  .vers p {{ margin: 0 0 20px; }}
  .vers ol {{ list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }}
  .ver {{ display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; background: var(--card); color: var(--ink); border-radius: 14px; padding: 12px 16px; box-shadow: 0 6px 16px rgb(var(--shadow) / .18); }}
  .ver b {{ font-size: 1.15rem; margin-right: 8px; }}
  .ver .t {{ font-weight: 700; }}
  .ver .d {{ display: block; color: var(--ink-soft); font-size: .9rem; }}
  .ver .new {{ background: var(--violet); color: #fff; border-radius: 99px; padding: 1px 8px; font-size: .8rem; margin-right: 8px; }}
  .ver .btn {{ margin: 0; white-space: nowrap; }}
  .ver .dl {{ color: var(--violet); font-weight: 800; }}
  @media (max-width: 560px) {{ .ver {{ grid-template-columns: 1fr; }} }}
</style>
</head>
<body>
<main class="vers">
  <h1>Every version, playable</h1>
  <p>Each release of Cardboard Kingdom stays playable here, exactly as it was. The newest one is always at <a href="play.html">play.html</a> too. Saves are shared by your browser, so an old version may not understand a newer save. Back to <a href="./">the website</a>.</p>
  <p><a class="btn" href="play.html">&#9654; Play the newest ({html.escape(current)})</a></p>
  <ol>
{chr(10).join(rows)}
  </ol>
</main>
</body>
</html>
'''
with open(os.path.join(site, 'versions.html'), 'w', encoding='utf-8') as f:
    f.write(page)
print(f'versions.html: {len(versions)} versions')

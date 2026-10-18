# Putting Cardboard Kingdom on GitHub (fresh Ubuntu)

Every block below is safe to paste into **any** terminal, from **any** folder. They use full paths
(`~/Downloads`, `~/projects/cardboard-kingdom`) so it doesn't matter where you are.

The plan: you download the source zip parts (`cardboard-kingdom-<version>-source-part1-of-N.zip` and the rest)
into `~/Downloads`, and Block 3 puts them together in `~/projects/cardboard-kingdom`, then creates the GitHub repo
(first time) or pushes the update (every time after).

---

## 1. Install the tools (once)

```bash
sudo apt update && sudo apt install -y git unzip zip python3 rsync curl wget
sudo mkdir -p -m 755 /etc/apt/keyrings \
 && wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
 && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
 && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
 && sudo apt update && sudo apt install -y gh
git --version && gh --version
```

## 2. Log in to GitHub (once)

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
git config --global user.name  "$(gh api user -q '.name // .login')"
git config --global user.email "$(gh api user -q '.id')+$(gh api user -q '.login')@users.noreply.github.com"
git config --global init.defaultBranch main
echo "Logged in as: $(gh api user -q .login)"
```

`gh auth login` prints a one-time code and opens your browser. Paste the code there and approve.
The email line uses your private GitHub "noreply" address so your real email stays out of the history.

## 3. Upload, or update (run this every time you get new source parts)

Download **every** `cardboard-kingdom-<version>-source-part…zip` for the newest version into `~/Downloads` first
(the project is split into parts so each one is small enough to share). Then paste the whole block:

```bash
bash <<'EOF'
set -euo pipefail
cd ~/Downloads
LATEST="$(ls cardboard-kingdom-*-source-part*.zip 2>/dev/null | sed -E 's/^cardboard-kingdom-(.*)-source-part.*$/\1/' | sort -V | tail -1)"
[ -n "$LATEST" ] || { echo "No cardboard-kingdom-*-source-part*.zip found in ~/Downloads"; exit 1; }
PARTS=(cardboard-kingdom-"$LATEST"-source-part*.zip)
NEED="$(echo "${PARTS[0]}" | sed -E 's/.*-of-([0-9]+)\.zip/\1/')"
[ "${#PARTS[@]}" -eq "$NEED" ] || { echo "Found ${#PARTS[@]} of $NEED parts for $LATEST. Download the rest first."; exit 1; }
echo "Version $LATEST, $NEED parts"
TMP="$(mktemp -d)"
for P in "${PARTS[@]}"; do unzip -qo "$P" -d "$TMP"; done
REPO="$HOME/projects/cardboard-kingdom"
mkdir -p "$REPO"
rsync -a --delete --exclude .git "$TMP/cardboard-kingdom/" "$REPO/"
rm -rf "$TMP"
cd "$REPO"
[ -d .git ] || git init -q -b main
git add -A
if git diff --cached --quiet; then echo "No changes to commit."; else git commit -q -m "Cardboard Kingdom v$(cat VERSION)" && echo "Committed: $(git log --oneline -1)"; fi
if ! git remote get-url origin >/dev/null 2>&1; then
  if gh repo view cardboard-kingdom >/dev/null 2>&1; then
    git remote add origin "$(gh repo view cardboard-kingdom --json url -q .url).git"
    git push -u origin main
  else
    gh repo create cardboard-kingdom --public --source=. --remote=origin --push \
      --description "A cozy cardboard RPG about engineering, seasons and water. Plays in any browser."
  fi
  gh api -X POST "repos/$(gh api user -q .login)/cardboard-kingdom/pages" -f build_type=workflow >/dev/null 2>&1 \
    && echo "GitHub Pages turned on." || echo "GitHub Pages already on (or turn it on in Settings > Pages > Source: GitHub Actions)."
else
  git push -u origin main
fi
TAG="v$(cat VERSION)"
if git ls-remote --tags origin | grep -q "refs/tags/$TAG\$"; then echo "Release $TAG already exists. Bump VERSION for a new download."; else git tag -f "$TAG" && git push origin "$TAG" && echo "Tagged $TAG: GitHub is now building the downloadable zip."; fi
echo
echo "Repo:     $(gh repo view --json url -q .url)"
echo "Play:     https://$(gh api user -q .login).github.io/cardboard-kingdom/   (ready a minute or two after the first push)"
echo "Releases: $(gh repo view --json url -q .url)/releases"
EOF
```

**Already uploaded an older version?** Just download the new parts and run Block 3 again. It commits only what
changed, pushes it, and because `VERSION` is new (2.15.0), it tags a new release with its own download.

What it does: puts the newest source parts back together, mirrors it into `~/projects/cardboard-kingdom`, commits,
creates the public repo the first time (or pushes to it after that), turns on GitHub Pages, and tags
the version so GitHub Actions builds a downloadable release.

## 4. See the current progress (any time)

```bash
cd ~/projects/cardboard-kingdom && git status -sb && echo && git log --oneline --graph --decorate -15
cd ~/projects/cardboard-kingdom && git show --stat --format='%h %s (%cr)' HEAD | head -40   # what the latest update changed
cd ~/projects/cardboard-kingdom && gh run list --limit 10      # Pages, Check and Release builds
cd ~/projects/cardboard-kingdom && gh run watch                # live view of the newest build
cd ~/projects/cardboard-kingdom && gh release list             # downloadable versions
cd ~/projects/cardboard-kingdom && gh repo view --web          # opens the repo (README with GIFs) in your browser
xdg-open "https://$(gh api user -q .login).github.io/cardboard-kingdom/"   # play the live game
```

## 5. Play it on this computer

```bash
xdg-open ~/projects/cardboard-kingdom/index.html
```

Or grab the release build exactly as anyone else would:

```bash
mkdir -p ~/Games && cd ~/Games \
 && gh release download -R "$(gh api user -q .login)/cardboard-kingdom" --pattern '*.zip' --clobber \
 && unzip -o cardboard-kingdom-*.zip && bash cardboard-kingdom-*/play.sh
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `gh: command not found` | Run Block 1 again. |
| `HTTP 401` / `authentication required` | Run Block 2 again. |
| `No cardboard-kingdom-*-source-part*.zip found` or `Found 3 of 5 parts` | Move every part into `~/Downloads`, or run `ls ~/Downloads` to check their names. |
| Push rejected ("fetch first") | The GitHub copy has commits you don't have. Run `cd ~/projects/cardboard-kingdom && git pull --rebase origin main && git push`. |
| Pages shows 404 | Wait for `gh run list` to show the Pages run as ✓, then reload. Check Settings > Pages > Source is **GitHub Actions**. |
| Want a new downloadable release of your own edits | `cd ~/projects/cardboard-kingdom && echo 2.15.1 > VERSION && git commit -am "v2.15.1" && git tag v2.15.1 && git push origin main v2.15.1` |

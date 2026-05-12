# Deploying to smmasruk.github.io — step-by-step

Everything you need is in this folder:

```
dist/
├── index.html        ← the new site (single self-contained file)
└── Masruk_CV.pdf     ← linked from the Download CV button
```

That's it. Two files. Both go at the **root** of your `smmasruk.github.io` repo.

---

## Option A — Terminal (recommended)

Run these in order. Replace the path in step 2 with wherever you saved this `dist/` folder.

```bash
# 1. Clone your repo (skip if you already have it locally)
git clone https://github.com/smmasruk/smmasruk.github.io.git
cd smmasruk.github.io

# 2. Copy the two new files in, overwriting the old index.html
cp /path/to/dist/index.html ./index.html
cp /path/to/dist/Masruk_CV.pdf ./Masruk_CV.pdf

# 3. (Optional) preview locally — open http://localhost:8000
python3 -m http.server 8000

# 4. Commit and push
git add index.html Masruk_CV.pdf
git commit -m "Redesign portfolio — astrophysics design system"
git push origin main
```

GitHub Pages rebuilds in ~30–60 seconds. Hard-refresh `https://smmasruk.github.io` (Cmd/Ctrl + Shift + R) to bypass the cache.

---

## Option B — GitHub web UI (no terminal)

1. Go to **https://github.com/smmasruk/smmasruk.github.io**
2. Click the existing `index.html` → pencil icon (Edit) → select all → delete.
3. Open the new `dist/index.html` in a text editor, copy everything, paste into GitHub's editor.
4. Scroll down → **Commit changes** (commit message: "Redesign portfolio").
5. Back at the repo root → **Add file → Upload files** → drag `Masruk_CV.pdf` in → **Commit changes**.

Done. Same 30–60 second deploy.

---

## Option C — GitHub Desktop

1. Open the `smmasruk.github.io` repo in GitHub Desktop.
2. In Finder/Explorer, drag `dist/index.html` and `dist/Masruk_CV.pdf` into the repo folder (overwrite when prompted).
3. GitHub Desktop shows the changes → write a summary → **Commit to main** → **Push origin**.

---

## After it's live — sanity checks

- [ ] `https://smmasruk.github.io` loads and the hero photo renders.
- [ ] Nav links jump to the right section.
- [ ] **Download CV** downloads `Masruk_CV.pdf`.
- [ ] Mobile: open on your phone, check the drawer menu opens.

---

## If something breaks

- **Site is blank** → open browser devtools (F12) → Console tab. The page transpiles JSX in-browser, so it needs `unpkg.com` to load React + Babel. If your network blocks unpkg, the page won't render — let me know and I'll pre-compile.
- **CV button does nothing** → make sure `Masruk_CV.pdf` is at the repo root with that exact filename (case-sensitive on GitHub Pages).
- **Hero image missing** → ESA's CDN occasionally goes down. The site falls back to a dark background; tell me if you want the image bundled locally instead.

---

## Updating later

When you want to change copy or add a publication:

- The **content** lives in `Sections.jsx` inside the design-system project (this Claude project). Edit there, ask me to re-bundle, drop the new `index.html` into your repo, push.
- Or: hand-edit `index.html` directly — it's one big file. Search for the text you want to change, change it, commit, push. Less elegant but it works.

# Editing and deploying smmasruk.github.io

The site is plain static files. There is no build step and nothing is loaded from a CDN at runtime.

```
index.html          all page content (edit text here)
assets/style.css    styling and design tokens
assets/main.js      starfield + interacting-binary animation, nav, scroll effects
assets/fonts.css    self-hosted @font-face rules
assets/fonts/       Instrument Serif, Newsreader, JetBrains Mono (woff2)
Masruk_CV.pdf       linked from the "Download CV" buttons
Masruk_Europass_cv.pdf
```

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

GitHub Pages serves `main`. Merge a pull request (or push) to `main`, wait about a minute,
then hard-refresh https://smmasruk.github.io (Ctrl/Cmd + Shift + R).

## Common edits

- **Text, publications, dates:** edit `index.html`. Each section has an `id` and a `§ 0N` number.
- **Colours and fonts:** the `:root` variables at the top of `assets/style.css`.
- **New CV:** replace `Masruk_CV.pdf` keeping the exact filename (GitHub Pages is case-sensitive).

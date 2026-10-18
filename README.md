# deeplink.gr

Static website for [deeplink.gr](https://deeplink.gr), hosted on GitHub Pages.

Restored from the Wayback Machine snapshot of 2025-03-22
(`https://web.archive.org/web/20250322131958/https://deeplink.gr/`), based on the
BootstrapMade FlexStart v1.7.0 template.

Changes from the archived version:

- Contact form, email address and portfolio section removed; location changed to Serres.
- Cloudflare email obfuscation and the discontinued Universal Analytics tag removed.
- Files the archive did not capture were re-sourced from the same upstream versions: AOS 2.3.4, GLightbox 3.1.0 JS, Bootstrap Icons 1.5.0 fonts, Remix Icon 2.5.0 fonts, and the FlexStart background images (`hero-bg.png`, `footer-bg.png`, `team-shape.svg`).
- The English page (`index-en.html`) was never archived, so the language switch is commented out.
- Added an AI solutions service, mobile/tablet layout fixes (`assets/css/custom.css`) and a static
  bilingual FAQ chatbot (`assets/js/chatbot.js`, `assets/css/chatbot.css`). The chatbot runs entirely
  in the browser: answers are canned and matched by keywords, and nothing is sent anywhere.

## Local preview

```sh
python -m http.server 8000
```

Then open http://localhost:8000/.

# Barvy & Text — projekt context

## Co projekt dělá
PWA pro barvoslepé. Přes kameru v reálném čase rozpoznává barvu v zaměřovači
a pojmenovává ji česky. Druhý režim přečte text z obrazu (OCR) a umí ho
přeložit CS↔EN. Cíl: Netlify deploy, později nativní iOS přes Capacitor.

## Tech stack
- **Vite 8** (build + dev server)
- **Vanilla JS** (ES modules, žádný framework)
- **Tesseract.js 5** (OCR, cs+eng)
- **MyMemory API** (překlad)
- **vite-plugin-pwa** (service worker, offline cache)
- **sharp** (dev-only, generuje PNG ikony ze zdrojového obrázku)

## Co je hotové
- Vite scaffold + npm projekt, vlastní `package.json`, `.gitignore`
- Kód z původního prototypu rozdělen do 7 modulů (`camera`, `color`,
  `lighting`, `ocr`, `ocr-cleanup`, `translate`, `ui`) + `main.js`
- Vlastní ikona (AI-generovaný eye), 4 PNG velikosti (180/192/512/512 maskable)
- `manifest.json`, iOS meta tagy v `index.html` (apple-touch-icon, status-bar)
- Service worker přes vite-plugin-pwa: precache app (~475 KB),
  runtime cache Tesseract worker/wasm/jazyků (1 rok), MyMemory NetworkFirst (1 h)
- Git inicializován (větev `main`), 2 commity, identita Jan + GitHub noreply
- Aplikace ověřena v prohlížeči — kamera, barvy, OCR, detekce osvětlení fungují

## Co je rozpracované
- **GitHub repo + Netlify auto-deploy** — bezprostředně další krok (KROK B).

## Otevřené otázky / rozhodnutí na později
- Bundlovat Tesseract jazyková data jako lokální assety vs. ponechat CDN?
  (Teď CDN přes runtime cache. Výhoda lokálního: žádný cold-start fetch
  ~16 MB při prvním OCR. Nevýhoda: větší build a deploy.)
- HTTPS pro mobilní testy na lokální Wi-Fi (Vite vyžaduje plugin).
- Capacitor integrace — kdy přesně, jaké nativní pluginy (Camera, Clipboard).
- Vlastní doména místo `*.netlify.app`?

## Plán dalších kroků
1. **KROK B** — GitHub repo + push + Netlify propojení (auto-deploy).
2. Test PWA na mobilu (instalace na home screen, offline režim).
3. Polishing: vyladit OCR confidence thresholds, lepší error messaging.
4. Capacitor wrapper pro iOS, TestFlight build.

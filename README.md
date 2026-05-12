# Barvy & Text

Progresivní webová aplikace (PWA) pro **barvoslepé** a pro lidi, kteří potřebují
rychle rozpoznat barvu nebo přečíst text v cizím jazyce. Aplikace běží v
prohlížeči (ideálně mobilním) a využívá kameru zařízení.

## Co umí

- **Režim Barva** — kamera v reálném čase rozpoznává barvu v centrálním
  zaměřovači a pojmenovává ji česky (např. „tmavě modrá", „béžová").
  Tap na panel zkopíruje název + HEX + RGB do schránky.
- **Režim Text** — zachytí snímek, předzpracuje ho (grayscale + kontrast)
  a pošle do OCR. Rozpoznaný text lze zkopírovat nebo přeložit.
- **Detekce osvětlení** — automatické varování při tmě, přepalu nebo
  odlescích.
- **Zmrazit obraz** — pauzne kameru pro stabilní odečet.

## Tech stack

- **[Vite](https://vitejs.dev/)** — build tool a dev server
- **Vanilla JavaScript** (ES modules) — bez frameworku, kód rozdělen do modulů
- **[Tesseract.js](https://tesseract.projectnaptha.com/)** — OCR (čeština + angličtina)
- **[MyMemory Translation API](https://mymemory.translated.net/)** — překlad CS ↔ EN
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — Service Worker + offline support

## Struktura projektu

```
src/
├── main.js          ← bootstrapper, event listenery
├── style.css
├── camera.js        ← getUserMedia + animační loop
├── color.js         ← paleta + pojmenování barev
├── lighting.js      ← analýza jasu a histogramu
├── ocr.js           ← preprocessing + Tesseract
├── ocr-cleanup.js   ← filtrování šumu z OCR výstupu
├── translate.js     ← MyMemory API klient
└── ui.js            ← DOM updaty (status, panely, …)
```

## Lokální vývoj

Vyžaduje **Node.js 18+** a npm.

```bash
npm install      # instalace závislostí
npm run dev      # spustí dev server na http://localhost:5173
```

> **Kamera v prohlížeči** funguje jen přes `https://` nebo `http://localhost`.
> Pro testování z mobilu na stejné Wi-Fi spusť `npm run dev -- --host` a
> přistupuj přes IP počítače (bude potřeba HTTPS — viz Vite docs).

## Build pro produkci

```bash
npm run build    # vytvoří optimalizovaný build do dist/
npm run preview  # lokálně spustí náhled produkčního buildu
```

## Roadmap

- [ ] Nasazení na Netlify
- [ ] PWA ikony (192×192, 512×512)
- [ ] Offline OCR (cache Tesseract worker + jazykové modely)
- [ ] Nativní iOS aplikace přes [Capacitor](https://capacitorjs.com/)

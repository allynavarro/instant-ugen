# Instant Ugen

Website til **Instant Ugen** — en halvårlig dansk begivenhed, der hylder instant-fotografering (Polaroid, Instax m.fl.). Første udgave løber i uge 42, 12.–18. oktober 2026.

Et projekt af Multimediedesign, EK — Erhvervsakademi København.

## Om sitet

Ren HTML/CSS/JS — ingen build-step, ingen framework. Fem sider:

- **Forside** (`index.html`) — tidsbevidst hero, "Hvad/hvorfor/hvordan", galleri med lightbox
- **Del dine instants** (`del-dine-instants.html`) — bidrag-formular (klient-side, ingen backend)
- **Vindere & nominerede** (`vindere-og-nominerede.html`)
- **Info** (`info.html`) — om projektet, dommere, sponsorer
- **Vilkår & betingelser** (`vilkaar-og-betingelser.html`)

## Kør lokalt

```bash
npm install
npm run dev
```

Åbner siden på `http://localhost:8080`.

## Struktur

```
css/       — style.css (tokens/base), layout.css (header/footer), samt side-specifik CSS
js/        — main.js (nav, hero, scroll-effekter), form.js (bidrag-formular)
images/    — galleri-fotos, logo
```

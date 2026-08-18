# democracia²¹ — web

Web principal de Democracia 21 ("La otra política"). Home narrativa one-page.

> **¿Retomas el proyecto?** Empieza por [HANDOFF.md](./HANDOFF.md) — resume
> qué hay hecho, qué está pendiente y de quién depende cada cosa.

- **Stack:** Astro 5 · React 19 (islands) · Tailwind CSS v4 (`@theme` en `src/styles/global.css`) · GSAP + ScrollTrigger · Lenis.
- **Diseño:** el estado real de cada sección vive en [DESIGN.md](./DESIGN.md) (reescrito 2026-08-18 para reflejar lo desplegado — no es un historial de cambios; para eso, `HANDOFF.md` y `_archive/`).
- **Backend:** lo lleva otra agencia. El form envía a `PUBLIC_FORM_ENDPOINT` (ver `.env.example`); sin definir, modo DEMO (no envía). Enlace de fallback al form provisional: `PUBLIC_JOIN_URL`.

## Comandos

```bash
npm install
npm run dev      # dev server (4321, o el puerto que indique .claude/launch.json)
npm run build    # build estática → dist/
npm run preview  # sirve dist/ ya construido (puerto 4333, "d21-preview" en launch.json)
npm run check    # astro check (0 errores antes de entregar)
```

## Estructura

```
src/
├── layouts/Layout.astro      # head/SEO + init Lenis + cursor
├── lib/motion.ts             # Lenis + GSAP compartidos (única instancia)
├── components/               # una sección de la home por fichero
│   ├── Preloader.astro  Hero.astro  Museo.astro (Statement)  Manifesto.astro
│   ├── Miriam.astro  Pilares.astro  Bento.astro
│   ├── PapeletaSection.astro + Papeleta.tsx (island, Quiz)
│   ├── Merch.astro  Join.astro + JoinForm.tsx (island)
│   ├── Nav.astro  Footer.astro
│   └── react-bits/chroma-card.tsx  (React Bits Pro, licencia en .env.local)
├── assets/brand/             # logos SVG oficiales (nunca recrear con texto)
└── styles/global.css         # tokens @theme — únicos hex del proyecto
public/img/                   # fotos reales del cliente, créditos en CREDITS.md
_archive/                     # código y specs retirados, con su propio README
democracia21.pen               # design system + secciones en Pencil.dev (edición visual)
```

## Reglas de la casa

1. Colores solo desde tokens. 2. Inter Tight en todo; logo solo SVG. 3. Copy canónico desde `brand-kit/copy-bank.md` (repo interno de Berraco). 4. `prefers-reduced-motion` respetado. 5. Mobile-first, 320px sin overflow-x. 6. No afirmar candidaturas/datos no confirmados (el partido está registrado; la concurrencia electoral no está anunciada) — Miriam González Durántez nunca se llama "candidata".

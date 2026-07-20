# democracia²¹ — web

Web principal de Democracia 21 ("La otra política"). Home narrativa one-page.

- **Stack:** Astro 5 · React 19 (islands) · Tailwind CSS v4 (`@theme` en `src/styles/global.css`) · GSAP + ScrollTrigger · Lenis.
- **Diseño:** el contrato creativo/técnico vive en [DESIGN.md](./DESIGN.md). La marca, en `~/Berraco/brain/clientes/12-democracia21/brand-kit/`.
- **Backend:** lo lleva otra agencia. El form envía a `PUBLIC_FORM_ENDPOINT` (ver `.env.example`); sin definir, modo DEMO (no envía). Enlace de fallback al form provisional: `PUBLIC_JOIN_URL`.

## Comandos

```bash
npm run dev      # dev server (4321, o el puerto que indique launch.json)
npm run build    # build estática → dist/
npm run check    # astro check (0 errores antes de entregar)
```

## Estructura

```
src/
├── layouts/Layout.astro      # head/SEO + init Lenis + cursor
├── lib/motion.ts             # Lenis + GSAP compartidos (única instancia)
├── components/               # una sección de la home por fichero
│   ├── Preloader.astro  Hero.astro  Museo.astro  Manifesto.astro
│   ├── Pilares.astro  PapeletaSection.astro + Papeleta.tsx (island)
│   ├── Merch.astro  Join.astro + JoinForm.tsx (island)
│   └── Nav.astro  Footer.astro
├── assets/brand/             # logos SVG oficiales (nunca recrear con texto)
└── styles/global.css         # tokens @theme — únicos hex del proyecto
public/img/                   # fotos (Unsplash, créditos en CREDITS.md)
```

## Reglas de la casa

1. Colores solo desde tokens. 2. Inter Tight en todo; logo solo SVG. 3. Copy canónico desde `brand-kit/copy-bank.md`. 4. `prefers-reduced-motion` respetado. 5. Mobile-first, 320px sin overflow-x. 6. No afirmar candidaturas/datos no confirmados (el partido está registrado; la concurrencia electoral no está anunciada).

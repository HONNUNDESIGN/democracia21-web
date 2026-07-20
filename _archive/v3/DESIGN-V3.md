# DESIGN-V3 — Restyle tipográfico + transiciones SVG (2026-07-03, ref: champions4good.club)

> Se aplica SOBRE lo existente (V1+V2). PROHIBIDO borrar contenido/секciones: solo cambia el aspecto visual y se añaden piezas. No copiar assets/copy/fuentes del sitio de referencia: extraemos patrones y los re-expresamos en marca D21.

## Patrones extraídos de la referencia

- Display **ultra-condensada ultra-negra en UPPERCASE a tamaños vw** (8–16vw) conviviendo con etiquetas diminutas (0.7–0.85rem, uppercase, tracking 0.15em) y párrafos normales 400/500 → contraste jerárquico brutal.
- Ritmo: pantalla de impacto tipográfico → bloque denso pequeño → pantalla de impacto…
- **Transiciones entre secciones**: wrappers pinneados con una animación de motivo (allí Lottie deportivo) que se dibuja/mueve con el scroll y "da paso" a la siguiente sección.

## Sistema tipográfico D21-v3

- Nueva display: **Anton** (`@fontsource/anton`, ya con impacto Druk-like). Token `--font-display` en global.css. `.display` pasa a: Anton, uppercase, tracking-tight (0.01em, Anton no necesita negativo agresivo), line-height 0.88. Inter Tight sigue siendo TODO el cuerpo/UI (regla de marca).
- Nueva clase `.label`: Inter Tight 600, uppercase, tracking [0.18em], text-xs/sm — para kickers/etiquetas pequeñas junto a los titulares gigantes.
- Escala: titulares de sección → `text-[11vw] md:text-[9vw]` mínimo; hero claim ~13vw; mezclar en un mismo titular palabras Anton con alguna palabra en Inter Tight itálica 400 (contraste black/normal de la referencia).

## WP-T1 · Barrido tipográfico global (todos los componentes, SOLO clases/estilos)

1. `global.css`: importar `@fontsource/anton`; añadir `--font-display: 'Anton', 'Inter Tight Variable', sans-serif`; redefinir `.display` (font-display, uppercase, lh 0.88, tracking .01em) y añadir `.label` y `.display-mix i` (Inter Tight itálica 400, lowercase, tamaño 0.85em) para la palabra "normal" dentro del titular black.
2. `package.json`: dep `@fontsource/anton` (ejecutar npm install SÍ está permitido en este WP).
3. Barrido por componentes (sin tocar copy ni estructura): Hero (claim "La otra política" → display gigante ~13vw con "otra" en `<i>`), Museo (título sección + "Pieza 0X"), Manifesto (la primera línea de cada estrofa en Anton uppercase; el resto sigue Inter Tight editorial), Miriam (nombre ya gigante → Anton; kicker → .label), Pilares (títulos de cards → Anton; números stroke más grandes), Bento (título sección), PapeletaSection (título quiz), Merch («Ropa que opina.» → Anton ~11vw; labels de producto → .label), Join («¿Y si ahora sí?» → Anton), Footer (enlaces .label). Ajustar line-heights/paddings para que nada se corte ni desborde (320px incluido). El TextPressure del footer NO se toca.

## WP-T2 · Transiciones SVG entre secciones (`TransitionSketch.astro` NUEVO + inserciones en index.astro)

Componente reutilizable: sección corta (h-[55vh] md:h-[70vh], pinneada con scrub en desktop) con un SVG inline ORIGINAL de line-art (stroke 3-4px, sin relleno) que se auto-dibuja (`stroke-dasharray/dashoffset` scrubbed) y hace un micro-movimiento antes de soltar, dando paso a la sección siguiente. Props: `motif` (slug), `bg` (token), `stroke` (token), frase `.label` opcional que acompaña. Reduced-motion/móvil: SVG estático ya dibujado, sin pin. Accesible: aria-hidden en el SVG.

Motivos (dibujarlos como paths simples propios, estilo pictograma de una línea):
1. `check` — una casilla cuadrada y el aspa dibujándose (guiño ☒ Siglo 21). Colocar entre **Hero → Museo** (bg ink, stroke lime) con label "primero, un paseo por el pasado".
2. `oreja` — oreja de una línea (guiño "Escuchar antes de hablar"/brandbook). Entre **Museo → Manifiesto** (bg ink, stroke lime), label "escuchar antes de hablar".
3. `papeleta` — rectángulo-papeleta cayendo en una urna de línea. Entre **Bento → Quiz** (bg gris, stroke ink), label "te toca".
4. `percha` — percha + camiseta de línea. Entre **Quiz → Colección** (bg yellow-merch, stroke ink), label "y esto se puede vestir".
Este WP es el ÚNICO que toca `index.astro` (importa TransitionSketch y añade las 4 instancias + `Maneras` antes de Join — ver WP-T3).

## WP-T3 · Sección nueva "Maneras de ser 21" (`Maneras.astro` NUEVO, id="maneras", antes de Join)

Inspirada en el índice de membresías gigante de la referencia, adaptada al funnel D21 (NO inventar estructuras de partido/cuotas): lista vertical de 4 filas gigantes en Anton uppercase (~8vw), cada una con número pequeño `.label`, palabra gigante, y una línea descriptiva Inter Tight 400 que aparece al hover (desktop) o visible (móvil). Filas → anclas internas:
1. 01 · **ESCÚCHALO** — "El manifiesto completo, sin teleprompter." → #manifiesto
2. 02 · **PONTE A PRUEBA** — "El test: ¿cómo de siglo 21 eres?" → #papeleta
3. 03 · **VÍSTELO** — "Drop 001. Ropa que opina." → #coleccion
4. 04 · **SÚMATE** — "Deja tu email. Lo demás llega solo." → #unete
Fondo paper, filas separadas por border-t border-ink/15, hover: la fila se rellena de lime (transición) y la flecha → se desplaza. Scroll suave vía window.__lenis o scrollIntoView.

## QA (todos los WP)

`npm run check` verde; 0 consola; sin overflow-x 320/390; reduced-motion digno; tokens only; nada de contenido eliminado.

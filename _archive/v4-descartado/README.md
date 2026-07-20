# v4 — descartado (limpieza 2026-07-17)

Ficheros movidos aquí tras auditoría completa del grafo de imports desde
`src/pages/index.astro`. Ninguno tenía ninguna referencia activa en el build
actual. Se conservan por si se quieren rescatar ideas/técnicas.

| Fichero | Razón |
|---|---|
| `components/FlyingPosters.tsx` | Isla WebGL (ogl) para el "Museo galería" antiguo. Sustituida por completo por `Museo.astro` con `react-bits/3d-text-reveal.tsx` ("statement 3D text reveal"). Documentado en `DESIGN-V2.md` como la versión previa del Museo. Solo la importaba `MuseoPosters.tsx` (también descartado). |
| `components/MuseoPosters.tsx` | Wrapper de `FlyingPosters` para el Museo antiguo. 0 imports en el árbol actual. Referenciaba imágenes (`museo-atril.jpg`, `museo-microfono.jpg`, `museo-fax.jpg`, `museo-urna.jpg`, `museo-sillon.jpg`) que ni siquiera existen ya en `public/img/`. |
| `components/ScrollFloat.tsx` | Isla React Bits para el efecto de chars flotando. Reemplazada por una versión nativa GSAP/ScrollTrigger portada directamente dentro de `Manifesto.astro` (ver comentarios en ese fichero: "más eficiente que 7 islas React (ScrollFloat.tsx) para el mismo timeline"). 0 imports. |
| `components/react-bits/blur-highlight.tsx` | Efecto "blur highlight" de párrafo. `Manifesto.astro` documenta explícitamente que "se ELIMINA" en una ronda anterior. 0 imports. Única consumidora de la dependencia npm `motion`. |
| `img/museo-personas-1.png` | Sin ninguna referencia en el código (ni siquiera en los componentes descartados de arriba). No documentado como pendiente en `public/img/CREDITS.md`. |
| `img/museo-personas-2.png` | Igual que el anterior — 0 referencias, no documentado como pendiente. |

Dependencias npm que quedaron sin ningún consumidor tras este movimiento y se
desinstalaron: `ogl` (solo la usaba `FlyingPosters.tsx`) y `motion` (solo la
usaba `blur-highlight.tsx`).

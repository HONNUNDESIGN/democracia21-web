# democracia²¹ — DESIGN.md (estado real de la home, 2026-08-18)

> Este documento describe la web **tal y como está desplegada hoy**, sección
> por sección. No es un historial de change-orders — para eso está
> `HANDOFF.md` y `_archive/v4-descartado/`. Si un componente contradice esto,
> gana el componente (y hay que actualizar este fichero).
>
> Marca: `~/Berraco/brain/clientes/12-democracia21/brand-kit/` (tokens.md,
> copy-bank.md) — repo interno de Berraco, no viene con este checkout.

## Concepto

Home narrativa de una sola página. Tono: sarcástico pero esperanzado, nunca
panfletario. El recorrido va de la marca (Hero) a una declaración directa sin
adornos (Statement), al manifiesto completo, a la persona detrás (Miriam), a
los ejes de trabajo, a un resumen en formato bento, a un test interactivo, a
la colección de merchandising y al formulario de alta.

**Funnel:** Hero → convicción directa (Statement) → manifiesto → cara humana
(Miriam) → ejes → resumen (Bento) → juego (Quiz) → deseo de marca (Colección)
→ conversión (Únete). CTA "Únete" + "Dona" persistentes en la Nav desde que
se sale del Hero.

## Reglas duras

1. Colores SOLO desde tokens de `src/styles/global.css` (`lime`, `ink`,
   `paper`, `turquesa`, `naranja`, `gris`, `yellow-merch`). Sin hex sueltos
   en componentes.
2. Tipografía: Inter Tight en todo (clase `.display` para titulares:
   weight 800, tracking -0.04em, lh 0.92). El logo solo desde SVG
   (`src/assets/brand/`), jamás recreado con texto.
3. Copy: castellano neutro, sarcasmo fino, nunca insultos ni nombres de
   partidos/personas reales fuera de Miriam González Durántez. **NO afirmar
   que el partido concurre a elecciones ni que Miriam es "candidata"** —
   la concurrencia electoral no está confirmada. Verbos permitidos: "impulsa",
   "da la cara", "fundó".
4. Animación: `import { gsap, ScrollTrigger } from '@/lib/motion'` en cada
   `<script>` de sección. Lenis ya está inicializado en `Layout.astro` — no
   crear otra instancia. Todo scrub va ligado al scroll.
5. `prefers-reduced-motion`: todo efecto tiene salida digna (contenido
   visible sin animación), vía `gsap.matchMedia()`.
6. Mobile-first: 320px sin overflow horizontal.
7. Cada componente es autónomo: `<style>` scoped + `<script>` propio, busca
   sus elementos por `data-*` con prefijo de sección.
8. Si falta una imagen (asset pendiente del cliente), el bloque se degrada
   con gracia (`onerror` oculta el contenedor), nunca rompe el layout.

## Secciones (orden real en `src/pages/index.astro`)

0. **Preloader** (`Preloader.astro`) — overlay de entrada, una vez por sesión
   (`sessionStorage`). Bloquea scroll mientras dura (`stopScroll`/`startScroll`
   de `@/lib/motion`).
1. **Nav** (`Nav.astro`, fixed) — aparece cuando se suelta el pin del Hero
   (`body[data-past-hero='true']`). Logo + enlaces de ancla a Statement /
   Manifiesto / Ejes / Colección (ocultos en móvil, no caben sin overflow) +
   botones **Únete** (píldora sólida) y **Dona** (píldora outline, ambos
   `href="#unete"` — no hay flujo de pago todavía, ver `HANDOFF.md`). Cambia
   de tema (negro↔blanco) según si la franja superior del viewport cae sobre
   una sección `data-nav-theme="dark"`.
2. **Hero** (`Hero.astro`, `id="top"`, fondo lima) — símbolo d²¹ real (SVG)
   centrado sobre overlay lima; al hacer scroll (pin largo, `+=250%`) un
   "agujero" en la máscara del overlay crece hasta revelar el claim de
   detrás: titular **"Volver a creer"** + subclaim + vídeo de fondo en
   autoplay silenciado (toggle de sonido propio, sin lightbox) + botones
   Únete/Dona. Marquee inferior con 12 frases cortas de marca. Vídeo real
   pendiente (`/video/miriam.mp4` da 404 — se ve la foto de fallback).
3. **Statement** (`Museo.astro`, `id="museo"`, internamente sigue llamándose
   "Museo" en el código) — byline "no mira a la derecha ni a la izquierda,
   mira hacia delante" + 3 bloques de color a pantalla completa apilados con
   `position: sticky` (mismo patrón que Pilares): ink → "Venimos a unir, no a
   dividir" (con la foto real de la pareja), lima → "13M" votantes sin
   representación, turquesa → "60%" cree que el bipartidismo es un problema.
4. **Manifiesto** (`Manifesto.astro`, `id="manifiesto"`, fondo ink) —
   scrollytelling con las 7 estrofas del manifiesto real (copy-bank),
   numeradas tipo folio (01/07…07/07), reveal por línea ligado a scroll.
   Clímax: "Ese sitio, esa herramienta, ese cambio, tiene nombre: la
   política, por fin, en el siglo que toca."
5. **Miriam** (`Miriam.astro`, `id="miriam"`, fondo lima) — "La que da la
   cara". Nombre gigante + foto (actual: informal, el feedback pide
   cambiarla — ver `HANDOFF.md`) + bio en una línea + cita destacada + CTA
   "Ella ya ha dado el paso. ¿Y tú? →". Sticker girado "Sí, una política que
   escucha. Qué locura."
6. **Pilares** (`Pilares.astro`, `id="pilares"`, fondo lima) — intro "Sin
   letra pequeña" + "Nuestra prioridad: una democracia que funciona para
   todos" + "Modernizar el país." Los 4 ejes como cards apiladas sticky
   (mismo patrón CSS que Statement): 01 Revolución educativa (ink/lime), 02
   Eficiencia de los servicios públicos (paper/ink), 03 Dinamización
   económica (turquesa/ink), 04 Vivienda y futuro (naranja/paper).
7. **Bento** (`Bento.astro`, `id="datos"`, fondo ink) — "En el centro de la
   democracia estás tú, no ellos." 4 cards (MagicBento, glow lima): Limpieza,
   Modernización, Tu vida, El método.
8. **Quiz** (`PapeletaSection.astro` + `Papeleta.tsx` isla React, `id="papeleta"`,
   fondo gris) — "Test oficial (no oficial)": "¿Cómo de siglo 21 eres?", 5
   preguntas con barra de progreso, resultado por tramos.
9. **Colección** (`Merch.astro`, `id="coleccion"`, fondo yellow-merch) —
   "Lleva lo que piensas." Grid asimétrico (estilo Outfit) con 7 productos
   reales del cliente (fotos en `public/img/`, créditos en
   `public/img/CREDITS.md`) + 1 tile tipográfico "21 / Decide quién decide."
   Hover: Chroma Card (React Bits Pro, WebGL). Grid compactado (feedback:
   "que ocupe menos espacio").
10. **Únete** (`Join.astro`, `id="unete"`, fondo ink) — "No te apuntes a un
    partido. Apúntate a lo que viene." Form (nombre, email, checkbox RGPD
    obligatorio + opcional) → `PUBLIC_FORM_ENDPOINT` o modo DEMO si no está
    definido. Enlace de fallback a `PUBLIC_JOIN_URL`.
11. **Footer** (`Footer.astro`) — marquee "21 es lo que sigue", CTA Únete +
    enlace "¿Tienes feedback? Cuéntanoslo →", nav secundaria, logotipo
    animado (isla TextPressure, fallback SVG estático).

## Sistema de animación (resumen técnico)

- Import: `import { gsap, ScrollTrigger } from '@/lib/motion';` en cada
  `<script>` de sección.
- Patrón preferido para secuencias de bloques a pantalla completa:
  **sticky-stack CSS** (`position: sticky; top: 0; height: 100vh`, elementos
  en flujo normal, sin pin de GSAP) — usado en Statement y Pilares. Más
  robusto y barato que un pin+scrub+mask: el apilado funciona por CSS puro,
  GSAP solo anima la entrada del contenido interior.
- Pin real (`ScrollTrigger.create({ pin: true, scrub: 1 })`) solo donde de
  verdad hace falta fijar el viewport durante un tramo largo — hoy solo en
  el Hero (transición de máscara del símbolo).
- Reveals de texto: `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)`,
  cleanup explícito (`clearProps` de las props concretas que GSAP tocó, nunca
  `'all'` sobre nodos con estilos inline propios de una isla React — borra
  cosas que GSAP no puso).
- `ScrollTrigger.refresh()` al final del script de cada sección que crea
  triggers nuevos.
- No plugins de pago de GSAP (SplitText/ScrollSmoother).

## QA de sección (antes de dar por hecha)

- `npm run check` pasa, 0 errores.
- `npm run build` sin errores (verificación sobre el build de producción, no
  solo el dev server).
- 320px y 375px sin overflow-x; desktop 1440px compuesto a sangre.
- Texto legible siempre (contraste AA sobre cada fondo).
- Sin `#hex` hardcodeados fuera de tokens.
- `prefers-reduced-motion`: contenido visible y legible sin animación.

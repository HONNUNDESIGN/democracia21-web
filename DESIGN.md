# democracia²¹ — DESIGN.md (contrato creativo y técnico de la home)

> Fuente de verdad del diseño. Si un componente contradice esto, gana esto.
> Marca: `~/Berraco/brain/clientes/12-democracia21/brand-kit/` (tokens.md, copy-bank.md).

## Concepto

**"LA OTRA POLÍTICA" contada como una visita en dos actos.** El usuario entra en la marca (lima radiante, tipografía gigante), baja al **Museo de la Vieja Política** (negro, sarcasmo: los "dinosaurios" expuestos como piezas de museo), atraviesa el **manifiesto** (scrollytelling que remonta de la oscuridad a la luz) y sale al futuro: pilares, una papeleta interactiva donde por fin puede marcar otra casilla, la colección de merch (marca de ropa) y el CTA de unirse. El humor es **estructural**: la interacción es el chiste (museo, papeleta), nunca panfleto.

**Funnel:** Hero → indignación con sonrisa (Museo) → convicción (Manifiesto) → concreción (Pilares) → acción simbólica (Papeleta) → deseo de marca (Colección) → conversión (Únete, email). CTA "Únete" persistente en nav.

## Reglas duras

1. Colores SOLO desde tokens de `src/styles/global.css` (`lime`, `ink`, `paper`, `turquesa`, `naranja`, `gris`, `yellow-merch`). Un acento sobre negro/lima, disciplina total (cf. Lando Norris SOTY 2025).
2. Tipografía: Inter Tight en todo (clase `.display` para titulares gigantes: weight 800, tracking -0.04em, lh 0.92). El logo solo desde SVG (`src/assets/brand/`), jamás texto.
3. Copy: usar frases literales de `brain/.../copy-bank.md`. Castellano neutro, sarcasmo fino, nunca insultos ni nombres de partidos/personas reales. NO afirmar que el partido concurre a elecciones ni prometer datos inventados (nada de cifras de afiliados).
4. Animación: GSAP + ScrollTrigger importados desde `@/lib/motion` (`import { gsap, ScrollTrigger } from '@/lib/motion'`). Lenis ya está inicializado en Layout — NO crear otra instancia. Todo scrub va ligado al scroll (scrub: true o valor 0.5–1), no timers decorativos.
5. `prefers-reduced-motion`: todo efecto debe tener salida digna (contenido visible sin animación). Usa `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)`.
6. Mobile-first: 320px sin overflow horizontal; pin/horizontal-scroll solo ≥768px (en móvil, layout vertical simple equivalente).
7. Cada componente es autónomo: su propio `<style>` scoped y `<script>` (Astro) que busca sus elementos por id/data-attr propios (prefijo por sección, p.ej. `data-museo-*`). Sin variables globales nuevas.
8. Imágenes en `/public/img/*.jpg` (generadas, pueden no existir aún en dev): usar `<img loading="lazy" decoding="async">` con `alt` decente y aspect-ratio fijado para no saltar layout. Si falta la imagen, el bloque debe seguir viéndose digno (background gris + texto).

## Secciones (orden en index.astro)

0. **Preloader** (`Preloader.astro`) — Overlay negro fullscreen z-[10000]. Punto lima 2.4vh centrado que late suave. Arriba a la derecha, contador que corre **1978 → 2026** (guiño: la democracia se quedó en el 78) en `.display` grande lima. Al llegar a 2026: el contador cambia a la palabra "ya." medio segundo, el punto escala hasta cubrir la pantalla (circle wipe lima) y el overlay se va con `clip-path` hacia arriba. Duración total ≤2.2s, `sessionStorage` para no repetirlo en la misma sesión. Bloquear scroll durante el preloader (`stopScroll/startScroll` de `@/lib/motion`). Reduced motion / sesión repetida: fade simple 300ms.
1. **Hero** (`Hero.astro`, `id="top"`, fondo lima) — 100lvh. Logotipo SVG negro gigante centrado (~82vw). ScrollTrigger pin del hero: al scrollear, el logo escala a ~0.9 y se desvanece con blur ligero (estilo podium.global) mientras entra el claim **"La otra política"** en `.display` enorme + subclaim "La política, por fin, en el siglo que toca.". Al soltar el pin → `document.body.dataset.pastHero = 'true'` (activa la Nav; ponerlo a 'false' si vuelves arriba). Abajo: marquee infinito (clase `.marquee-track`) con "DEMOCRACIA 21 ✦ LA OTRA POLÍTICA ✦ MUY 21 ✦" y hint de scroll ("baja, que esto mejora ↓"). En móvil sin pin: logo grande + claim apilados.
2. **Museo de la Vieja Política** (`Museo.astro`, `id="museo"`, fondo ink, texto paper) — Título de entrada: "Bienvenido al museo de la vieja política." + subtítulo sarcástico ("Entrada gratuita. Ya la pagaste con tus impuestos."). **Horizontal scroll pinneado** (≥768px): 5 piezas de museo, cada una imagen `/img/museo-*.jpg` (atril, microfono, fax, urna, sillon) con **placa de museo**: nombre de pieza + datación + estado. Copys de placa (usar tal cual):
   - Atril: «Atril de promesas. ca. 1982–2026. Uso intensivo en campaña, inactivo el resto del ciclo.»
   - Micrófono: «Rueda de prensa sin preguntas. Pieza en perfecto estado: nunca se usó para escuchar.»
   - Fax: «Tecnología punta de la Administración. Aún en funcionamiento. No es broma.»
   - Urna: «Cheque en blanco. Se rellena cada 4 años. Devoluciones: no admite.»
   - Sillón: «Escaño vitalicio. Especie protegida. En peligro de extinción a partir de ahora.»
   Última "pieza" del recorrido: un espejo tipográfico — panel lima con texto negro: «Pieza 06: Tú, esperando que cambie solo.» y debajo pequeño: «(Esta pieza sale del museo hoy.)». Detalle guerrilla: un cartel colgado torcido estilo "SE ALQUILA" amarillo-merch con «La política también es esto ☎ 888 888 888». Parallax sutil en las imágenes (y-scrub). En móvil: lista vertical de cards.
3. **Manifiesto** (`Manifesto.astro`, `id="manifiesto"`, fondo ink → lima) — Scrollytelling pinneado: las líneas del manifiesto real (copy-bank, íntegro y literal) se revelan línea a línea (fade+y con scrub, palabra a palabra en las frases clave "No somos los que gritan más fuerte", "con gente que no se escaquea", "tú no has perdido las ganas"). Tipografía grande (clamp 1.6rem→3.4rem, weight 700), texto paper sobre ink, con palabras clave en lima. Clímax: «Ese sitio, esa herramienta, ese cambio, tiene nombre:» → el fondo hace wipe a lima y aparece el logotipo SVG negro + «La política, por fin, en el siglo que toca.» Móvil: mismas líneas con reveal simple al entrar en viewport (sin pin).
4. **Pilares** (`Pilares.astro`, `id="pilares"`, fondo lima) — Intro: «Sin letra pequeña.» + «Cinco cosas. Dichas claro. Hechas de verdad.» Luego los 5 pilares (copy-bank) como **cards apiladas sticky** (cada card `position: sticky; top: X` con offset creciente y scale-down de la anterior): 01 Ciudadanía primero / 02 Reformas postergadas, ahora sí / 03 Transparencia sin excepciones / 04 Tecnología con dirección / 05 Estrategia a largo plazo, no ocurrencias. Fondos alternos: ink (texto lima), paper, turquesa, naranja (texto ink/paper según contraste), gris. Cada card: número gigante `.text-stroke`, titular `.display`, una línea de apoyo (escríbela sobria, 1 frase, sin inventar políticas concretas). Funciona sin JS (sticky CSS); GSAP solo para el scale sutil.
5. **Papeleta** (`PapeletaSection.astro` + `Papeleta.tsx` React island `client:visible`, `id="papeleta"`, fondo gris) — El minijuego. Una papeleta electoral (card blanca, borde ink, sombra dura, tipografía de papeleta real) con: «ELECCIONES A LO DE SIEMPRE — Marque una opción:» ☐ Derecha ☐ Izquierda ☒ **Siglo 21** (la de la camiseta icónica). Interacción: si marcas Derecha o Izquierda, la casilla **se escapa/tiembla** y aparece microcopy sarcástico rotativo («Eso ya lo has probado.», «¿Otra vez? Qué siglo XX por tu parte.», «Error 404: futuro no encontrado.»). Si marcas **Siglo 21**: check animado, la papeleta se inclina y "se dobla" (CSS transform), burst de confetti tipográfico (spans "21" en lima/turquesa/naranja con GSAP physics simple) y aparece: «Buena elección. Ahora hazla de verdad → **Únete**» (botón ancla a #unete). Estado en React, sin dependencias nuevas. Accesible: inputs radio reales + aria-live para el microcopy.
6. **Colección** (`Merch.astro`, `id="coleccion"`, fondo yellow-merch — única sección con el amarillo saturado) — «COLECCIÓN 001» + «Ropa que opina.» + línea: «Un partido que se pueda vestir. Literal.» **Grid asimétrico estilo Outfit**: grid-cols-8 (móvil) / 16 (desktop), tiles con col-span/col-start variables (composición collage, 8 productos). Cada tile: imagen producto `/img/{tee-flat,tee-model,tee-model-2,cap,mug,tote,hoodie}.jpg` + **slogan superpuesto en CSS** (Inter Tight bold, negro, posicionado sobre la prenda simulando la serigrafía) — slogans literales: «☐ Derecha ☐ Izquierda ☒ Siglo 21», «dēmos + kratos», «¿Y si ahora sí?», «No es tarde.», «Optimismo radical», «CTRL + ALT + DEMOCRACIA», «Escuchar antes de hablar» (mug), «Sin letra pequeña» (tote), «Loading futuro...» (cap). Hover (técnica Outfit verificada): capa que entra con `clip-path` wipe izquierda→derecha 500ms `cubic-bezier(0.87,0,0.13,1)` + de `brightness(4) contrast(1.5)` a normal + scale 1.2→1; badge circular ink «PRONTO» siguiendo el patrón "VIEW MORE". Los productos NO tienen precio ni carrito: es pre-lanzamiento («Drop 001 — próximamente. Los primeros en la lista lo estrenan.») → CTA a #unete. Marquee del título con «MUY 21 ✦ VERSIÓN 21 ✦ MODO FUTURO ✦».
7. **Únete** (`Join.astro`, `id="unete"`, fondo ink) — «¿Y si ahora sí?» en `.display` gigante lima (reveal por palabras). Párrafo: «Miles de personas ya han dejado su email. No para mirar: para empezar.» Form mínimo (nombre, email, checkbox RGPD obligatorio) en una card lima: envía a `PUBLIC_FORM_ENDPOINT` (Web3Forms style) o, si no está definido, modo DEMO (console + estado éxito). Éxito: «Hecho. Eres oficialmente muy 21.» Botón submit: «Apúntame a la otra política». Enlace secundario discreto al form provisional (`PUBLIC_JOIN_URL`). Validación es-ES, sin librerías.
8. **Footer** (`Footer.astro`, ya existe — no tocar).

## Sistema de animación (resumen técnico)

- Import: `import { gsap, ScrollTrigger } from '@/lib/motion';` en `<script>` de cada .astro (client-side). En React: `import { gsap } from 'gsap'` está bien (misma instancia bundle).
- Pins de secciones: `ScrollTrigger.create({ trigger, pin: true, scrub: 1 })` dentro de `gsap.matchMedia()` con breakpoint `(min-width: 768px) and (prefers-reduced-motion: no-preference)`.
- Reveals de texto: dividir en `<span>` palabras (helper `splitLines` en `@/lib/motion` o spans manuales en el markup), stagger 0.03–0.06, `y: '110%'` con overflow hidden en el wrapper, ease `expo.out`.
- No usar plugins de pago de GSAP (SplitText/ScrollSmoother). Nada de three.js.
- Al final de cada script de sección: `ScrollTrigger.refresh()` no es necesario (lo hace el último componente/Layout); evita llamadas globales duplicadas.

## QA de sección (antes de dar por hecha)

- `npm run check` pasa. Cero errores de consola.
- 320px y 390px sin overflow-x; desktop 1440px compuesto a sangre.
- Texto legible siempre (contraste AA sobre cada fondo).
- Sin `#hex` hardcodeados fuera de tokens.

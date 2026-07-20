# DESIGN-V2 — Change order de Nacho (2026-07-03)

> Revisión sobre DESIGN.md (que sigue vigente en todo lo no contradicho aquí).
> React Bits YA INSTALADO en `src/components/`: FlyingPosters.tsx, ScrollFloat.tsx, MagicBento.tsx, TextPressure.tsx, GradualBlur.tsx (son ficheros locales NUESTROS: se pueden modificar/adaptar). Dep nueva: `ogl`.
> Regla global: mantener tokens, Inter Tight, bordes redondeados generosos (rounded-2xl/3xl) y sombras suaves — NADA de sombras planas rectangulares. `prefers-reduced-motion` con salida digna en todo. Mobile-first.

## Orden final de secciones (index.astro)

Preloader → Nav → **Hero (rework podium)** → Museo (FlyingPosters) → Manifesto (ScrollFloat) → **Miriam (NUEVA)** → Pilares (sin cambios) → **Bento (NUEVA)** → Quiz (sustituye a la papeleta, mismo id) → Merch (sin cambios) → Join (sin cambios) → Footer (TextPressure). GradualBlur fijo global en Layout.

## WP-A · Hero rework "podium" (`Hero.astro`)

Reemplazar la coreografía actual (que falla: `end:'+=100%'` deja el claim solapado con el Museo) por el patrón podium.global descrito por Nacho:

1. **Capa overlay** a pantalla completa en lima que cubre el hero al cargar. Centrado, el **símbolo corto**: PLACEHOLDER = círculo negro (~22vh) — comentario `<!-- PLACEHOLDER logo d²¹: sustituir por SVG del imagotipo cuando Nacho lo pase -->`. NO usar el logotipo completo "democracia21" aquí.
2. **Hover en el símbolo** (desktop): blur + ligera pérdida de opacidad (transition suave, se recupera al salir).
3. **Al hacer scroll** (pin largo, `end: '+=250%'`, scrub): el símbolo **crece** progresivamente (scale hasta ~30-40, transform-origin center) mientras se difumina (blur + opacity→0), y el overlay lima pierde opacidad, **revelando lo que hay detrás**.
4. **Detrás del overlay** (contenido del hero real, visible al disolverse): claim gigante `.display` "La otra política" + "La política, por fin, en el siglo que toca." + fondo con `crowd.jpg` sutil (opacity ~0.15, grayscale, blend multiply sobre lima) para que la revelación "muestre algo". El claim tiene su propio tramo del timeline: entra cuando el overlay ya se ha ido y **se mantiene legible al menos un 40% del pin** antes de soltar (así el Museo ya no lo pisa).
5. `body.dataset.pastHero` como ahora (onLeave/onEnterBack). Marquee inferior y "baja, que esto mejora ↓" se conservan (sobre el overlay o debajo, criterio del ejecutor).
6. Móvil/reduced-motion: sin pin — overlay estático 100svh con símbolo + claim apilado debajo en flujo.
7. Coordinación Preloader (`d21:intro-done`) se mantiene.

## WP-B · Museo con FlyingPosters (`Museo.astro` + adaptar `FlyingPosters.tsx`, nueva isla `MuseoPosters.tsx`)

- Mantener: título "Bienvenido al museo…", subtítulo, cartel SE ALQUILA, pieza 06 (panel lima) y versión móvil actual (cards verticales) como fallback.
- Desktop: sustituir el scroll horizontal casero por la isla **FlyingPosters en modo horizontal** (`client:only="react"`, WebGL/ogl) con las 5 imágenes museo-*.jpg. Adaptar `FlyingPosters.tsx` (es local): que fluya horizontal y **exponga el ítem activo** (hover o click sobre un plano → callback `onItemActive(index)` o similar; leer el fichero y decidir la vía menos invasiva).
- **Placa al hover/click** del cuadro activo: overlay DOM (no WebGL) con: **título en bold** + detalle en cuerpo más pequeño, peso menor e *itálica*. Contenido EXACTO:
  1. **Atril de promesas** — *ca. 1982–2026. Uso intensivo en campaña, inactivo el resto del ciclo.*
  2. **Rueda de prensa sin preguntas** — *Pieza en perfecto estado: nunca se usó para escuchar.*
  3. **Tecnología punta de la Administración** — *Aún en funcionamiento. No es broma.*
  4. **Cheque en blanco** — *Se rellena cada 4 años. Devoluciones: no admite.*
  5. **Escaño vitalicio** — *Especie protegida. En peligro de extinción a partir de ahora.*
- Estilo placa: caja paper, texto ink, rounded-2xl, esquina "d²¹ MUSEO". Accesible: los 5 títulos+detalles también en DOM oculto legible por lector de pantalla.
- Si WebGL no disponible (fallback), mostrar la versión móvil.

## WP-C · Manifesto editorial con ScrollFloat (`Manifesto.astro`)

- Sustituir el reveal actual por **ScrollFloat** por estrofa/línea (usar la isla o portar su técnica GSAP char-float si islas múltiples penalizan; criterio del ejecutor, pero el efecto debe ser el de ScrollFloat: chars flotando desde abajo con stagger, scrub).
- **Tipografía mucho más grande y editorial** (revista): clamp(2.4rem → 6.5rem), weight 800 para frases clave, alternar alineaciones (izq/centro/der), palabras clave en lime, alguna palabra en `.text-stroke` y alguna en *itálica* serif-feel (itálica de Inter Tight) para ritmo visual de revista. Números de estrofa pequeños tipo folio ("01/07").
- Mantener texto LITERAL del manifiesto (copy-bank) y el clímax con wipe a lima + logotipo + tagline. Mantener fallback móvil.

## WP-D · Quiz "¿Cómo de siglo 21 eres?" (`PapeletaSection.astro` + `Papeleta.tsx` → reescribir como quiz; MANTENER id="papeleta" y nombres de fichero para no tocar index/Footer)

- Sustituye al minijuego actual. Sección más grande: card central max-w-3xl, `rounded-3xl`, sombra suave difusa (NADA de shadow plano rectangular), padding generoso, fondo gris → card lima/paper. Título sección: "TEST OFICIAL (no oficial)" + "¿Cómo de siglo 21 eres?".
- 5 preguntas, una a una, con barra de progreso lima y transición suave entre preguntas. Tono sarcasmo fino. Preguntas (usar estas):
  1. "Un político promete 'regeneración'. ¿Tú qué haces?" → a) Le creo, como en 1996 (0) b) Sonrío con cariño y pido pruebas (50) c) Pruebas, plazos y quién lo audita. Luego hablamos (100)
  2. "¿Cada cuánto debería rendir cuentas un cargo público?" → a) Cada 4 años ya es mucho (0) b) Una vez al año, con PowerPoint (50) c) En continuo, con datos publicados (100)
  3. "Tu Administración ideal funciona como…" → a) Un fax: fiable desde 1994 (0) b) Una web del 2010: casi (50) c) Una app que no te hace ir presencialmente (100)
  4. "¿Escuchar antes de hablar?" → a) Hablar es gratis (0) b) Depende de quién hable (50) c) Listening is so 21 (100)
  5. FINAL (la papeleta icónica, ahora sí se puede marcar cualquiera): "Marque una opción:" ☐ Derecha (0) ☐ Izquierda (0) ☒ Siglo 21 (100)
- Resultado: % (media) con contador animado + mensaje por tramo: 0–40 «Dinosaurio en fase de negación. El museo tiene una vitrina con tu nombre.» / 41–75 «Híbrido. Un pie en el fax y otro en el futuro. Aún hay esperanza.» / 76–100 «Optimismo radical certificado. Eres oficialmente muy 21.» + botón "Únete →" (#unete) y "Repetir test". aria-live en resultado, radios reales, teclado OK.

## WP-E · Bento informativo (`Bento.astro` NUEVO + adaptar `MagicBento.tsx`)

- Nueva sección `id="datos"` tras Pilares, **fondo ink**, título: "d²¹, en piezas." + sub "Lo que cabe en una pantalla. Sin letra pequeña."
- **MagicBento** con `enableBorderGlow` y **glowColor lima "232, 230, 117"** (neón amarillo como el ejemplo morado), enableSpotlight, tilt suave. Adaptar el componente local para aceptar cards por props (ahora trae data hardcodeada) y para respetar tokens (fondo cards ink/negro con borde white/10).
- 6 cards (solo hechos verificados, castellano neutro):
  1. label "Registro" — **24 · 06 · 2026** — "Partido inscrito en el Ministerio del Interior. Papeles en regla. Qué novedad."
  2. label "Quién" — **Miriam González Durántez** — "Abogada. Fundadora de España Mejor. La que da la cara." (ancla #miriam)
  3. label "El nombre" — **21 no es un número** — "Es una fecha límite. Y una invitación a volver a creer."
  4. label "Ejes" — **Ni izquierda ni derecha: siglo 21** — "Regeneración, instituciones que funcionen, país competitivo."
  5. label "Método" — **Escuchar antes de hablar** — "Política que escucha, suma y construye."
  6. label "Drop 001" — **Ropa que opina** — "Un partido que se puede vestir. Literal." (ancla #coleccion)
- Enlaces de card por wrapper (no romper el efecto). Móvil: grid 1 col, glow desactivable si penaliza (disableAnimations en móvil).

## WP-F · Footer TextPressure + GradualBlur global (`Footer.astro` + `Layout.astro`)

- Footer: sustituir el SVG gigante inferior por la isla **TextPressure** con `text="democracia21"`, **Inter Tight Variable** (ya cargada por @fontsource; adaptar el componente para no exigir fontUrl externo), `weight` activado (grosores cambian al pasar el ratón), width/italic/stroke off, textColor blanco, sobre el fondo ink. Comentario: `<!-- Tratamiento tipográfico aprobado por Nacho; validar con Alberto (regla logo-solo-SVG) -->`. Fallback (móvil/reduced-motion/sin JS): el SVG actual.
- Layout.astro: montar **GradualBlur** FIJO en la parte baja del viewport para TODA la web: position bottom, altura ~7rem (menos en móvil), strength ~2.5, curve bezier, `pointer-events:none`, zIndex 40 (bajo la Nav z-50). Leer el componente: si tiene modo page/fixed usarlo; si no, envolver en un div fixed propio. Exento en `prefers-reduced-motion` (no montar).

## WP-G · Sección Miriam — "La que da la cara" (`Miriam.astro` NUEVA, `id="miriam"`)

Concepto: tras el clímax del manifiesto ("tiene nombre: democracia21") la pregunta natural es *¿y quién hay detrás?* → respuesta editorial tipo **portada de revista**:
- Fondo lima. Kicker pequeño uppercase: "La que da la cara". Nombre GIGANTE `.display` en 2–3 líneas: "MIRIAM GONZÁLEZ DURÁNTEZ" (mezclar una palabra en `.text-stroke` para el ritmo editorial).
- **Foto grande** a un lado: `/img/miriam-01.jpg` — AÚN NO EXISTE (biblioteca en Drive pendiente): usar el patrón onerror → frame digno (bg-gris rounded-3xl con "FOTO · biblioteca Drive" en pequeño). Tratamiento cuando exista: duotono ink/lima (CSS filter grayscale + capa lime en mix-blend-multiply) + borde rounded-3xl. Detalle: sticker girado (-4deg) bg-ink text-lime: «Sí, una política que escucha. Qué locura.»
- Bio en UNA línea sobria: "Abogada especializada en comercio internacional. Fundadora de España Mejor. Casi una década en la Comisión Europea."
- Cita real destacada (comillas gigantes lime): «La brecha entre la sociedad y la clase política es enorme.» — atribución pequeña: "Miriam González Durántez".
- PROHIBIDO: llamarla "candidata" o dar por hecha su concurrencia electoral. Verbos: "impulsa", "da la cara", "fundó".
- CTA texto-link a #unete: "Ella ya ha dado el paso. ¿Y tú? →". Reveal editorial al entrar (palabras del nombre con y:110% stagger, foto con clip-path).

## QA de cada WP

`npm run check` verde, 0 consola, sin overflow-x 320/390, reduced-motion digno, sin hex fuera de tokens (excepción: glowColor numérica del Bento = lima). No tocar ficheros de otros WP.

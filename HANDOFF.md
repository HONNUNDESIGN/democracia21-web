# Traspaso del proyecto — democracia²¹ web

> Última actualización: 2026-08-18, por Berraco (Nacho). Este documento existe
> para que quien retome el proyecto (equipo técnico del cliente) entienda en
> minutos qué hay hecho, qué falta y de quién depende cada cosa pendiente.

## Qué es esto

Home narrativa de una sola página para Democracia 21 ("La otra política"),
construida por Berraco (agencia de diseño). Astro 5 + React 19 + Tailwind v4
+ GSAP/ScrollTrigger + Lenis. El backend (usuarios, base de datos, pagos) lo
lleva **otra agencia** — este repo es solo frontend, con endpoints
configurables por variables de entorno.

- **Repo:** este mismo (`HONNUNDESIGN/democracia21-web`, público).
- **Deploy de referencia (staging, no producción):** Cloudflare Pages,
  proyecto `democracia21-web` → `https://democracia21-web.pages.dev`.
- **Diseño editable visualmente:** `democracia21.pen` en la raíz del repo —
  archivo de [Pencil.dev](https://pencil.dev) con el design system (colores,
  tipografía) y las 10 secciones replicadas como frames nombrados. Pensado
  para hacer cambios de diseño (pequeños o grandes) sin tocar código
  directamente; luego se portan a los componentes reales.
- **Cómo correrlo:** ver [README.md](./README.md) — `npm install && npm run dev`.

## Cómo llegar hasta aquí (resumen, no exhaustivo)

El proyecto pasó por varias iteraciones de diseño — el detalle completo está
archivado en `_archive/v4-descartado/` (con su propio README explicando qué
se descartó y por qué) y en `_archive/v3/`. En resumen:

1. Primera versión: concepto "Museo de la Vieja Política" (piezas de museo,
   scroll horizontal). Descartado.
2. "Hero podium" (el actual, con el símbolo d²¹ y el efecto de máscara al
   hacer scroll) + Miriam + Bento como secciones nuevas. Estas sí quedaron.
3. Un restyle completo (V3, inspirado en champions4good.club) fue
   **rechazado explícitamente por el cliente** y revertido por completo.
4. El "statement" (sección `Museo.astro`, hoy con id `#museo`) tuvo una
   iteración larga con un efecto de texto 3D (React Bits Pro) — muy trabajado
   técnicamente, pero **el 2026-08-18 el cliente pidió quitarlo entero** (ver
   siguiente sección). El componente sigue instalado en
   `_archive/v4-descartado/components/react-bits/3d-text-reveal.tsx` por si
   se quiere reaprovechar en otro sitio.

`DESIGN.md` en la raíz **no** es un historial — describe la web tal y como
está desplegada ahora mismo, sección por sección.

## Última ronda de cambios (2026-08-18) — feedback directo de los socios

El cliente mandó un PPT con capturas comentadas y un HTML aparte (el
"Corruptómetro"). Se ejecutaron los cambios que no dependían de asets
pendientes del cliente:

| Sección | Cambio |
|---|---|
| Nav | Menú de anclas a las secciones + botón "Dona" junto a "Únete", ambos siempre visibles (antes solo había Únete, al final del scroll). |
| Hero | Fuera "Dēmos × Krátos" → nuevo titular "Volver a creer". Quitado el lightbox de clic ("Escúchala"); el vídeo ya reproduce en autoplay, con un toggle de sonido discreto en su lugar. |
| Statement (`Museo.astro`) | **Cambio grande.** Eliminado el efecto de texto 3D y las tarjetas posteriores. Sustituido por 3 bloques de color a pantalla completa (mismo patrón `position: sticky` que Pilares, sin pin de GSAP): "Venimos a unir, no a dividir" / "13M votantes sin representación" / "60% cree que el bipartidismo es un problema". |
| Pilares | Nuevo titular: "Nuestra prioridad: una democracia que funciona para todos" + "Modernizar el país." |
| Footer | Añadido enlace "¿Tienes feedback? Cuéntanoslo →". |
| Colección (Merch) | Grid compactado — bastante menos alto que antes. |

Verificado: `npm run check` (0 errores) y `npm run build` sin errores, sin
overflow horizontal a 320/375/1440px.

## Pendiente — y de quién depende

**Bloqueado por assets o texto del cliente** (nada que hacer en código hasta
recibirlos):

- Foto nueva de Miriam (la actual, según el cliente, es "demasiado
  informal") + un texto de manifiesto emocional firmado por ella, para una
  columna nueva junto a su foto.
- Vídeo real para el Hero (`/video/miriam.mp4`, hoy da 404 — se ve el
  fallback de foto).
- Fotos + bios del equipo para una sección nueva ("Los que quieren el
  cambio") justo después de Miriam — el cliente dijo que ya están en un
  Drive compartido.
- Pantone exacto del amarillo de marca, para ajustar el token
  `--color-lime` si hace falta (el cliente dice que el actual "se ve
  matado" frente al del logo).

**Pendiente de decisión** (no es un bloqueo técnico, es una pregunta abierta):

- ¿Pilares queda en 4 ejes + Bento aparte, o se fusionan en una estructura
  de 5 con el nuevo copy que mandó el cliente? El copy recibido no encaja
  limpio en la estructura actual de dos secciones separadas.
- Qué significa exactamente el comentario del cliente sobre el Quiz ("si lo
  vemos en las carpetas, no haría falta") — podría leerse como "quitarlo" o
  como "está bien así". No se ha tocado hasta confirmar.
- El Corruptómetro (adjunto del cliente, `outputs/atlas-de-lo-publico.html`
  en su correo — no incluido en este repo) — ¿se enlaza tal cual (paleta
  propia, crema/negro/amarillo) o se reestiliza a la marca d²¹?

**Fuera de alcance de un "sitio de marketing"** — son piezas de producto,
necesitan su propio alcance y presupuesto:

- **Espacio 21**: área privada con contraseña para afiliados y agrupaciones
  provinciales. Necesita autenticación y gestión de usuarios/roles reales
  (backend), no es un componente más de esta home. Falta decidir quién lo
  construye.
- **Botón "Dona"**: hoy solo enlaza al formulario de alta (`#unete`), no hay
  flujo de pago. La financiación de partidos políticos en España está
  regulada (identificación del donante, límites) — antes de construir nada
  aquí, esto tiene que pasar por quien lleve el cumplimiento legal del
  partido.

## Variables de entorno

Ver `.env.example`. Ninguna es obligatoria — sin definir, el form de alta
funciona en modo demo (no envía, vuelca por consola).

```
PUBLIC_FORM_ENDPOINT=   # backend del form (otra agencia) o Web3Forms
PUBLIC_FORM_ACCESS_KEY=
PUBLIC_JOIN_URL=        # fallback: link al form provisional
```

Aparte, `.env.local` (no versionado) tiene `REACTBITS_LICENSE_KEY` — licencia
de React Bits Pro, usada por `components.json` para instalar/actualizar el
componente `Chroma Card` de la Colección. Sin esa key, `npm install` /
`npm run dev` funcionan igual (el componente ya está instalado en el repo);
solo hace falta para *añadir* componentes Pro nuevos vía su CLI.

## Desplegar a staging

```bash
npm run build
npx wrangler pages deploy dist --project-name=democracia21-web
```

Cualquier duda sobre decisiones de diseño o el porqué de algo, contactar con
Berraco (Nacho).

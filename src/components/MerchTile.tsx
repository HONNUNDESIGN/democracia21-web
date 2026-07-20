'use client';

// Isla React que envuelve UN tile de producto de Merch.astro con el efecto
// "Chroma Card" de React Bits (WebGL, chromatic aberration + parallax de
// puntero). Sustituye al hover anterior (clip-path wipe + brightness +
// badge "PRONTO"). El grid/composición (col-span, aspect-ratio, label
// debajo) se queda en Merch.astro sin tocar — esta isla solo reemplaza el
// contenido visual/interactivo DENTRO del frame de cada tile.
//
// Adaptación táctil: chroma-card.tsx (registry) se editó para escuchar
// Pointer Events (no solo mouse) — ver comentarios en ese fichero — así
// que en móvil un tap ya dispara el efecto sin cambios aquí.
//
// Medición manual del contenedor (bug detectado en QA): el <Canvas> de
// @react-three/fiber se queda anclado al tamaño por defecto de un
// <canvas> (300×150) cuando su padre inmediato solo tiene "width:100%;
// height:100%" y ESE padre, a su vez, obtiene su tamaño real de la clase
// `aspect-[…]` de Astro (Merch.astro) en vez de un px explícito — el
// ResizeObserver interno de r3f no llega a recalcular en ese caso. Fix:
// medimos el contenedor y pasamos width/height NUMÉRICOS (px) a ChromaCard,
// dándole a su <Canvas> un tamaño concreto desde el primer render.
//
// La medida INICIAL se toma de forma síncrona con getBoundingClientRect()
// en useLayoutEffect (no esperamos al primer callback de ResizeObserver,
// que llega en una cola aparte tras el layout/paint) — así no hay frame en
// blanco esperando esa primera medición. ResizeObserver se queda solo para
// re-medir si el contenedor cambia de tamaño más tarde (resize de ventana).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ChromaCard from '@/components/react-bits/chroma-card';

// QA ronda 4 fix 3c: cámara del ChromaCard (fov + z, ver <Canvas camera>
// abajo) fija el frustum visible a una altura constante en el espacio 3D,
// INDEPENDIENTE del aspect ratio del tile. Antes cardWidth estaba fijo a 5
// y cardHeight = 5/boxAspectRatio — eso solo "encajaba" el plano en el
// frustum por coincidencia para tiles cercanos a 3/4 (la mayoría de la
// colección). En el tile 4/3 (gorra-21.webp) el plano quedaba más pequeño
// que el frustum, dejando un margen vacío alrededor de la imagen que se
// veía como una caja de fondo mayor que la propia foto. Calculamos la
// altura real del frustum a esa distancia (fórmula estándar de cámara en
// perspectiva) y derivamos cardWidth/cardHeight de ahí para CUALQUIER
// aspect ratio, así el plano siempre llena el canvas exactamente.
const CAMERA_FOV = 45;
const CAMERA_Z = 8;
const FRUSTUM_HEIGHT = 2 * CAMERA_Z * Math.tan((CAMERA_FOV * Math.PI) / 360);

interface MerchTileProps {
  img: string;
  alt: string;
  nombre: string;
  /** Ratio del box CSS, ej. "3/4", "4/3" — debe coincidir con la clase aspect-[…] del contenedor Astro. */
  boxRatio: string;
  /** Ratio real de la foto (ancho/alto) para que el shader recorte "cover" sin deformar. */
  imageAspectRatio: number;
}

export default function MerchTile({ img, alt, nombre, boxRatio, imageAspectRatio }: MerchTileProps) {
  const [broken, setBroken] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const boxAspectRatio = useMemo(() => {
    const [w, h] = boxRatio.split('/').map(Number);
    return w && h ? w / h : 0.75;
  }, [boxRatio]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentBoxSize?.[0];
      const width = box ? box.inlineSize : el.clientWidth;
      const height = box ? box.blockSize : el.clientHeight;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (broken) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gris p-4 text-center text-sm font-extrabold uppercase tracking-[0.04em] text-ink/50">
        {nombre}
      </div>
    );
  }

  return (
    // QA ronda 4 fix 3b: se quita el bg-gris de este contenedor — con el
    // canvas alpha:true (sin clearColor propio, ver chroma-card.tsx) ese
    // gris/blanco era exactamente lo que se veía tras la imagen al hacer
    // hover (el plano se desplaza/escala con el puntero y deja de tapar el
    // canvas por completo). Ahora queda transparente y deja ver el amarillo
    // de la sección Merch.astro detrás, en reposo Y en hover.
    <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-2xl">
      {size && (
        <ChromaCard
          width={size.width}
          height={size.height}
          imageSrc={img}
          imageAspectRatio={imageAspectRatio}
          cardWidth={FRUSTUM_HEIGHT * boxAspectRatio}
          cardHeight={FRUSTUM_HEIGHT}
          borderRadius={22}
          zoomLevel={0.22}
          rgbShiftAmount={0.016}
          pixelDisplaceAmount={0.05}
          rotationIntensity={0.14}
          scaleIntensity={0.06}
          positionIntensity={0.35}
          /* QA ronda 4 fix 3a: efecto más lento "para que se disfrute" —
             hoverDuration (transición del shader u_hover) e
             interactionDuration (tilt/parallax al mover el puntero) se
             duplican largamente respecto a la versión anterior (0.6/0.35). */
          hoverDuration={1.4}
          interactionDuration={0.85}
          cameraFov={CAMERA_FOV}
          cameraZ={CAMERA_Z}
        />
      )}
      {/* Preflight de carga: si la imagen real falla, cae al label digno
          (mismo criterio que el fallback anterior en Merch.astro). */}
      <img
        src={img}
        alt={alt}
        aria-hidden="true"
        className="sr-only"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

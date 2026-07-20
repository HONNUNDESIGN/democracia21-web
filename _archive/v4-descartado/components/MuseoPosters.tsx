import { useState } from 'react';
import FlyingPosters from './FlyingPosters';

// Museo de la Vieja Política — versión desktop con FlyingPosters (WebGL/ogl).
// Ver DESIGN-V2.md §WP-B para el contrato: 5 piezas, placa DOM al hover/click.

interface Pieza {
  titulo: string;
  detalle: string;
}

const IMAGENES = [
  '/img/museo-atril.jpg',
  '/img/museo-microfono.jpg',
  '/img/museo-fax.jpg',
  '/img/museo-urna.jpg',
  '/img/museo-sillon.jpg',
];

const PIEZAS: Pieza[] = [
  {
    titulo: 'Atril de promesas',
    detalle: 'ca. 1982–2026. Uso intensivo en campaña, inactivo el resto del ciclo.',
  },
  {
    titulo: 'Rueda de prensa sin preguntas',
    detalle: 'Pieza en perfecto estado: nunca se usó para escuchar.',
  },
  {
    titulo: 'Tecnología punta de la Administración',
    detalle: 'Aún en funcionamiento. No es broma.',
  },
  {
    titulo: 'Cheque en blanco',
    detalle: 'Se rellena cada 4 años. Devoluciones: no admite.',
  },
  {
    titulo: 'Escaño vitalicio',
    detalle: 'Especie protegida. En peligro de extinción a partir de ahora.',
  },
];

export default function MuseoPosters() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePieza = activeIndex !== null ? PIEZAS[activeIndex] : null;

  return (
    <div className="relative h-full w-full">
      <FlyingPosters
        items={IMAGENES}
        planeWidth={480}
        planeHeight={620}
        distortion={2.5}
        scrollEase={0.015}
        onItemActive={setActiveIndex}
        className="h-full w-full"
      />

      {/* Placa DOM del cuadro activo (hover o click) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-5 transition-opacity duration-300 md:bottom-10"
        style={{ opacity: activePieza ? 1 : 0 }}
        aria-hidden="true"
      >
        <div className="relative max-w-md rounded-2xl bg-paper px-6 py-5 text-ink shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          <span className="absolute -top-3 right-4 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-lime">
            d²¹ MUSEO
          </span>
          <p className="text-base font-bold leading-snug md:text-lg">{activePieza?.titulo ?? ''}</p>
          <p className="mt-1 text-sm italic font-normal text-ink/60 md:text-base">
            {activePieza?.detalle ?? ''}
          </p>
        </div>
      </div>

      {/* Contenido accesible: los 5 títulos+detalles siempre en el DOM para lectores de pantalla */}
      <ul className="sr-only">
        {PIEZAS.map((p) => (
          <li key={p.titulo}>
            <strong>{p.titulo}</strong> — {p.detalle}
          </li>
        ))}
      </ul>
    </div>
  );
}

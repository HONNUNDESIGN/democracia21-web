// Quiz "¿Cómo de siglo 21 eres?" — la acción simbólica del funnel (DESIGN-V2 WP-D).
// Isla React aislada: importa gsap directo (NO @/lib/motion) para no cargar
// ScrollTrigger en el bundle del cliente. Estado local, sin dependencias nuevas.
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface Opcion {
  id: string;
  label: string;
  valor: number;
}

interface Pregunta {
  id: string;
  texto: string;
  opciones: Opcion[];
}

// Change-order v4 (2026-07-04): 5 preguntas nuevas. Los valores 0/50/100 se
// asignan por sentido ("21-ness" de la respuesta), no mecánicamente por
// posición — ver criterio anotado en cada pregunta donde el orden no es 1:1.
const PREGUNTAS: Pregunta[] = [
  {
    id: 'p1',
    texto: 'Tienes que hacer un trámite con la Administración. ¿Qué esperas?',
    opciones: [
      // Orden de "21-ness" 50/0/100: la paciencia "por si acaso" es la
      // opción más vieja del trío (resignación ante la Administración lenta),
      // por debajo incluso de la expectativa neutra de rapidez.
      { id: 'a', label: 'Que sea rápido.', valor: 50 },
      { id: 'b', label: 'Llevar paciencia... por si acaso.', valor: 0 },
      { id: 'c', label: 'Hacerlo desde el móvil en cinco minutos.', valor: 100 },
    ],
  },
  {
    id: 'p2',
    texto: 'Si una ley afecta a tu vida, lo mínimo que debería pasar es...',
    opciones: [
      { id: 'a', label: 'Que alguien la explique bien.', valor: 0 },
      { id: 'b', label: 'Que puedas entenderla sin un abogado.', valor: 50 },
      { id: 'c', label: 'Que además puedas opinar antes de que se apruebe.', valor: 100 },
    ],
  },
  {
    id: 'p3',
    texto: 'Cuando escuchas "consenso político", piensas en...',
    opciones: [
      // Criterio anotado: se mantiene el mapeo literal 100/50/0 por orden de
      // aparición — "gente resolviendo problemas" es la lectura más
      // funcional/21 del consenso; "depende de para qué" es el escepticismo
      // de en medio; "ojalá se hablara más de acuerdos" es deseo resignado,
      // no acción. Alternativa 50/0/100 evaluada y descartada por sonar menos
      // coherente con el resto del test.
      { id: 'a', label: 'Gente resolviendo problemas.', valor: 100 },
      { id: 'b', label: 'Depende de para qué.', valor: 50 },
      { id: 'c', label: 'Ojalá se hablara más de acuerdos.', valor: 0 },
    ],
  },
  {
    id: 'p4',
    texto: 'Una propuesta pública cuesta millones de euros. Tú preguntas...',
    opciones: [
      { id: 'a', label: '¿Cuánto cuesta?', valor: 0 },
      { id: 'b', label: '¿Quién la paga?', valor: 50 },
      { id: 'c', label: '¿Cómo sabremos si ha funcionado?', valor: 100 },
    ],
  },
  {
    id: 'p5',
    texto: 'Dentro de diez años, te gustaría que España fuera un país...',
    opciones: [
      { id: 'a', label: 'Donde sea más fácil prosperar.', valor: 50 },
      { id: 'b', label: 'Donde funcionen mejor las instituciones.', valor: 50 },
      { id: 'c', label: 'Donde ambas cosas sean la norma.', valor: 100 },
    ],
  },
];

const TOTAL_PREGUNTAS = PREGUNTAS.length;

interface Tramo {
  min: number;
  max: number;
  mensaje: string;
}

const TRAMOS: Tramo[] = [
  {
    min: 0,
    max: 40,
    mensaje: 'Dinosaurio en fase de negación. El museo tiene una vitrina con tu nombre.',
  },
  {
    min: 41,
    max: 75,
    mensaje: 'Híbrido. Un pie en el fax y otro en el futuro. Aún hay esperanza.',
  },
  {
    min: 76,
    max: 100,
    mensaje: 'Optimismo radical certificado. Eres oficialmente muy 21.',
  },
];

function mensajePorPorcentaje(pct: number): string {
  const tramo = TRAMOS.find((t) => pct >= t.min && pct <= t.max) ?? TRAMOS[0];
  return tramo.mensaje;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function irAUnete() {
  const target = document.querySelector<HTMLElement>('#unete');
  const lenis = (
    window as unknown as { __lenis?: { scrollTo: (t: Element, opts?: object) => void } }
  ).__lenis;
  if (lenis && target) {
    lenis.scrollTo(target, { offset: 0 });
  } else if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function Papeleta() {
  const [pasoActual, setPasoActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [finalizado, setFinalizado] = useState(false);
  const [contador, setContador] = useState(0);
  const groupName = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const contadorRafRef = useRef<number | null>(null);

  const pregunta = PREGUNTAS[pasoActual];
  const progresoPct = finalizado
    ? 100
    : Math.round((pasoActual / TOTAL_PREGUNTAS) * 100);

  const resultadoPct = useCallback(() => {
    const valores = Object.values(respuestas);
    if (valores.length === 0) return 0;
    const suma = valores.reduce((acc, v) => acc + v, 0);
    return Math.round(suma / valores.length);
  }, [respuestas]);

  const animarTransicion = useCallback((onMitad: () => void) => {
    const card = cardRef.current;
    if (!card || prefersReducedMotion()) {
      onMitad();
      return;
    }
    gsap
      .timeline()
      .to(card, { opacity: 0, y: -12, duration: 0.22, ease: 'power2.in' })
      .add(() => {
        onMitad();
      })
      .fromTo(
        card,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }
      );
  }, []);

  const elegir = useCallback(
    (opcion: Opcion) => {
      const esUltima = pasoActual === TOTAL_PREGUNTAS - 1;
      const nuevasRespuestas = { ...respuestas, [pregunta.id]: opcion.valor };

      animarTransicion(() => {
        setRespuestas(nuevasRespuestas);
        if (esUltima) {
          setFinalizado(true);
        } else {
          setPasoActual((p) => p + 1);
        }
      });
    },
    [pasoActual, pregunta.id, respuestas, animarTransicion]
  );

  const repetir = useCallback(() => {
    animarTransicion(() => {
      setPasoActual(0);
      setRespuestas({});
      setFinalizado(false);
      setContador(0);
    });
  }, [animarTransicion]);

  // Contador animado del % al finalizar.
  useEffect(() => {
    if (!finalizado) return;
    const destino = resultadoPct();

    if (prefersReducedMotion()) {
      setContador(destino);
      return;
    }

    const duracionMs = 900;
    const inicio = performance.now();

    const tick = (ahora: number) => {
      const t = Math.min((ahora - inicio) / duracionMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setContador(Math.round(destino * eased));
      if (t < 1) {
        contadorRafRef.current = requestAnimationFrame(tick);
      }
    };

    contadorRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (contadorRafRef.current !== null) {
        cancelAnimationFrame(contadorRafRef.current);
      }
    };
  }, [finalizado, resultadoPct]);

  // Teclado: 1/2/3 seleccionan opción de la pregunta activa.
  useEffect(() => {
    if (finalizado) return;
    const handler = (e: KeyboardEvent) => {
      const index = Number(e.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < pregunta.opciones.length) {
        elegir(pregunta.opciones[index]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pregunta, finalizado, elegir]);

  const pct = finalizado ? contador : 0;
  const mensajeFinal = finalizado ? mensajePorPorcentaje(resultadoPct()) : '';

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Barra de progreso lime */}
      <div
        className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-valuenow={progresoPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del test"
      >
        <div
          className="h-full rounded-full bg-lime transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progresoPct}%` }}
        />
      </div>

      <div
        ref={cardRef}
        className="relative rounded-3xl bg-paper px-6 py-10 shadow-[0_8px_40px_-8px_rgba(10,11,13,0.25)] sm:px-10 sm:py-14"
      >
        {!finalizado ? (
          <div>
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-ink/40">
              Pregunta {pasoActual + 1} de {TOTAL_PREGUNTAS}
            </p>
            <h3 className="display mt-4 text-center text-2xl text-ink sm:text-3xl">
              {pregunta.texto}
            </h3>

            <fieldset className="mt-8 flex flex-col gap-3">
              <legend className="sr-only">{pregunta.texto}</legend>
              {pregunta.opciones.map((opcion) => (
                <label
                  key={opcion.id}
                  className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-ink/10 px-5 py-4 transition-colors duration-200 hover:border-lime hover:bg-lime/10"
                >
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink/30 transition-colors duration-200 group-hover:border-ink">
                    <input
                      type="radio"
                      name={`papeleta-${groupName}-${pregunta.id}`}
                      value={opcion.id}
                      onChange={() => elegir(opcion)}
                      className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span className="pointer-events-none h-2.5 w-2.5 scale-0 rounded-full bg-lime transition-transform duration-150 peer-checked:scale-100" />
                  </span>
                  <span className="text-base font-semibold text-ink sm:text-lg">
                    {opcion.label}
                  </span>
                </label>
              ))}
            </fieldset>

            <p className="mt-6 text-center text-xs text-ink/40">
              Truco: pulsa 1, 2 o 3 en tu teclado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/40">
              Resultado
            </p>
            <p className="display text-6xl text-ink sm:text-7xl">{pct}%</p>
            <p className="max-w-md text-lg text-ink/70 sm:text-xl">{mensajeFinal}</p>

            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={irAUnete}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-lime transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                Únete →
              </button>
              <button
                type="button"
                onClick={repetir}
                className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink/60 transition-colors duration-200 hover:border-ink hover:text-ink"
              >
                Repetir test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

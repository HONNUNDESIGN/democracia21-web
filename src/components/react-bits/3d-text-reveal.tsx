"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ThreeDTextRevealProps {
  items: string[];
  className?: string;
  textClassName?: string;
  scrollDistance?: string;
  perspective?: number;
  radiusOffset?: number;
  startRotation?: number;
  endRotation?: number;
  scrubSmoothing?: number;
  fontSize?: string;
  fontWeight?: number;
  gap?: number;
  /**
   * Modo de control externo: cuando es `true` el componente NO crea su
   * propio ScrollTrigger con `pin` — solo posiciona los items en el
   * círculo (seno/coseno) y deja el contenedor 3D listo en `startRotation`.
   * El rotateX start→end pasa a ser responsabilidad de un timeline EXTERNO
   * (p.ej. un pin maestro que ya pinea la sección completa), que debe
   * animar el nodo marcado con `data-three-d-text-reveal-container`.
   * Evita crear dos ScrollTriggers con pin en conflicto cuando este
   * componente se integra dentro de una sección que ya está pineada por
   * otro motivo (p.ej. cards que aparecen después del reveal).
   *
   * El componente avisa que está listo dos formas: llamando a `onReady`
   * (si se pasa) y disparando un CustomEvent `tdr:ready` (bubbles) desde
   * el wrapper — útil cuando el consumidor no tiene una ref directa
   * (p.ej. una isla React montada desde un componente Astro).
   */
  externalControl?: boolean;
  onReady?: (container: HTMLDivElement, wrapper: HTMLDivElement) => void;
}

// Defaults = la config exacta del cliente para esta instalación (licencia
// @reactbits-starter/3d-text-reveal, única pantalla donde se usa en este
// proyecto). El brief del cliente traía estos items pegados con un error
// de sintaxis (una coma + "delante," sueltos detrás del array de cierre:
// `] , delante,`), que rompía el literal — se corrige aquí escribiendo el
// array completo y válido. Sus saltos de línea A MANO no se tocan: ni una
// coma distinta a las suyas.
const ThreeDTextReveal: React.FC<ThreeDTextRevealProps> = ({
  items = ["no mira a la", "derecha ni a", "la izquierda,", "mira hacia", "delante"],
  className = "",
  textClassName = "",
  scrollDistance = "200vh",
  perspective = 1000,
  radiusOffset = 0.4,
  startRotation = -80,
  endRotation = 220,
  scrubSmoothing = 1,
  fontSize = "clamp(3rem, 9vw, 7rem)",
  fontWeight = 900,
  gap = 15,
  externalControl = false,
  onReady,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (!wrapperRef.current || !containerRef.current) return;

      const updatePositions = () => {
        if (!containerRef.current) return;

        const radius = window.innerHeight * radiusOffset;

        itemsRef.current.forEach((item, index) => {
          if (!item) return;

          const angleInDegrees = index * gap;
          const angleInRadians = (angleInDegrees * Math.PI) / 180;

          const y = Math.sin(angleInRadians) * radius;
          const z = Math.cos(angleInRadians) * radius;
          const rotation = -angleInDegrees;

          gsap.set(item, {
            y: y,
            z: z,
            rotateX: rotation,
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "50%",
          });
        });
      };

      updatePositions();

      const refreshHandler = () => updatePositions();
      ScrollTrigger.addEventListener("refresh", refreshHandler);

      // ── Modo control externo: nada de ScrollTrigger/pin propio. Dejamos
      // el contenedor en su rotación inicial y avisamos al consumidor
      // (callback + evento DOM) de que ya puede empezar a animarlo desde
      // fuera como un tramo más de SU timeline scrubbed. ──
      if (externalControl) {
        gsap.set(containerRef.current, { rotateX: startRotation });

        onReady?.(containerRef.current, wrapperRef.current);
        wrapperRef.current.dispatchEvent(
          new CustomEvent("tdr:ready", {
            bubbles: true,
            detail: {
              container: containerRef.current,
              wrapper: wrapperRef.current,
            },
          }),
        );

        return () => {
          ScrollTrigger.removeEventListener("refresh", refreshHandler);
        };
      }

      const scroller = wrapperRef.current.closest(
        "[data-scroll-container]",
      ) as HTMLElement;

      const scrollTriggerConfig: ScrollTrigger.Vars = {
        trigger: wrapperRef.current,
        start: "top",
        end: `+=${scrollDistance}`,
        pin: true,
        scrub: scrubSmoothing,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      if (scroller) {
        scrollTriggerConfig.scroller = scroller;
      }

      const timeline = gsap.timeline({
        scrollTrigger: scrollTriggerConfig,
      });

      timeline.fromTo(
        containerRef.current,
        {
          rotateX: startRotation,
        },
        {
          rotateX: endRotation,
          ease: "none",
        },
      );

      return () => {
        ScrollTrigger.removeEventListener("refresh", refreshHandler);
      };
    },
    {
      dependencies: [
        items,
        scrollDistance,
        radiusOffset,
        startRotation,
        endRotation,
        scrubSmoothing,
        gap,
        externalControl,
      ],
      scope: wrapperRef,
    },
  );

  return (
    <div
      ref={wrapperRef}
      data-three-d-text-reveal-root
      className={cn(
        "relative w-full h-screen overflow-hidden flex flex-col items-center justify-center",
        className,
      )}
      style={{
        perspective: `${perspective}px`,
        // Máscara vertical: se lee entera en el centro y se difumina hacia
        // los dos bordes. Los 4 stops necesitan color explícito — un stop
        // sin color entre dos colores es un "color hint" (interpolación),
        // no una repetición del color anterior, así que hay que escribirlo
        // completo o el navegador descarta el gradiente entero (mask-image
        // inválido → sin máscara, texto siempre visible de golpe).
        //
        // Banda opaca 14%–86% (antes 20%–80%): margen de seguridad extra
        // para la línea legible. El centrado vertical de cada item es
        // matemáticamente exacto en su instante legible (pasa por el
        // centro exacto del wrapper) — el recorte real venía de la altura
        // PROYECTADA del texto (fontSize + line-height por defecto del
        // navegador, amplificados por la perspectiva) pudiendo superar la
        // banda opaca en viewports altos. Ver Museo.astro (fontSize +
        // leading-none) para el fix de raíz; esto es solo margen extra.
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      <div
        ref={containerRef}
        data-three-d-text-reveal-container
        className="absolute inset-0 text-center"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            data-three-d-text-reveal-item={index}
            className={cn(
              "absolute top-1/2 left-1/2 whitespace-nowrap font-black uppercase",
              textClassName,
            )}
            style={{
              fontSize: fontSize,
              fontWeight: fontWeight,
              backfaceVisibility: "hidden",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

ThreeDTextReveal.displayName = "ThreeDTextReveal";

export default ThreeDTextReveal;

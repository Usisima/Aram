"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import styles from "./Intro.module.css";

/** Retraso e inicio de cada uno de los cinco paths, en segundos. */
const DELAYS = [0, 0.5, 0.7, 1.3, 1.1];
const DURS = [1.3, 0.4, 1.0, 0.8, 1.1];
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const FILL_DUR = 0.7;
const FADE_DUR = 0.25;

/** Cuanto se queda el splash en pantalla antes de empezar a desvanecerse. */
const PERMANENCIA = 3400;
/** Debe coincidir con la transicion de opacidad de .intro. */
const DESVANECIDO = 750;

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [oculto, setOculto] = useState(false);
  const [montado, setMontado] = useState(true);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const reducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const paths = Array.from(nodo.querySelectorAll<SVGPathElement>("path"));

    if (reducido) {
      // Sin animacion: el logo aparece ya relleno y sin contorno.
      for (const p of paths) {
        p.style.fillOpacity = "1";
        p.style.stroke = "none";
      }
    } else {
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        if (len < 10) {
          // Artefacto del SVG, no aporta nada dibujarlo.
          p.style.display = "none";
          return;
        }

        const delay = DELAYS[i] ?? i * 0.2;
        const dur = DURS[i] ?? 0.9;
        // El relleno arranca justo antes de que el trazo se cierre.
        const inicioRelleno = delay + dur - 0.2;

        p.style.strokeDasharray = String(len);

        p.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          {
            duration: dur * 1000,
            delay: delay * 1000,
            easing: EASE,
            fill: "forwards",
          },
        );

        p.animate([{ fillOpacity: 0 }, { fillOpacity: 1 }], {
          duration: FILL_DUR * 1000,
          delay: inicioRelleno * 1000,
          easing: "ease",
          fill: "forwards",
        });

        p.animate([{ strokeOpacity: 1 }, { strokeOpacity: 0 }], {
          duration: FADE_DUR * 1000,
          delay: (inicioRelleno + FILL_DUR) * 1000,
          easing: "ease",
          fill: "forwards",
        });
      });
    }

    const salida = setTimeout(() => setOculto(true), PERMANENCIA);
    const retirada = setTimeout(
      () => setMontado(false),
      PERMANENCIA + DESVANECIDO,
    );

    return () => {
      clearTimeout(salida);
      clearTimeout(retirada);
    };
  }, []);

  if (!montado) return null;

  return (
    <div
      ref={ref}
      className={`${styles.intro} ${oculto ? styles.hide : ""}`}
      aria-hidden="true"
    >
      <Logo
        className={styles.logo}
        pathClassName={styles.path}
        idPrefix="intro"
      />
    </div>
  );
}

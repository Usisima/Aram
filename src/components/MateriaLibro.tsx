"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, Sigma } from "lucide-react";
import styles from "./MateriaLibro.module.css";

/** El prompt pide animaciones de unos 200 ms. */
const DUR = 0.2;
/** La apertura necesita un poco mas para leerse antes de navegar. */
const DUR_APERTURA = 0.26;

interface Props {
  nombre: string;
  color: string;
  href: string;
  numLibros: number;
  numDemostraciones: number;
  /** Ya formateada en el servidor, para que cliente y servidor coincidan. */
  ultimaActualizacion?: string;
}

export default function MateriaLibro({
  nombre,
  color,
  href,
  numLibros,
  numDemostraciones,
  ultimaActualizacion,
}: Props) {
  const router = useRouter();
  const reducido = useReducedMotion();
  const [abriendo, setAbriendo] = useState(false);

  function abrir(evento: React.MouseEvent<HTMLAnchorElement>) {
    // Respetar clic central, ctrl+clic y demas: son "abrir en otra pestana".
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) {
      return;
    }
    evento.preventDefault();
    if (abriendo) return;

    if (reducido) {
      router.push(href);
      return;
    }

    setAbriendo(true);
    setTimeout(() => router.push(href), DUR_APERTURA * 1000);
  }

  return (
    <Link
      href={href}
      onClick={abrir}
      className={styles.marco}
      style={{ ["--tono" as string]: color }}
      aria-label={`${nombre}: ${numLibros} libros, ${numDemostraciones} demostraciones`}
    >
      <motion.div
        className={styles.libro}
        style={{ boxShadow: "0 8px 18px -10px rgba(0,0,0,0.45)" }}
        whileHover={{
          y: -10,
          scale: 1.035,
          boxShadow: "0 22px 38px -14px rgba(0,0,0,0.55)",
        }}
        transition={{ duration: DUR, ease: "easeOut" }}
      >
        <div className={styles.interior} aria-hidden="true" />

        <motion.div
          className={styles.portada}
          animate={{ rotateY: abriendo ? -108 : 0 }}
          transition={{ duration: DUR_APERTURA, ease: "easeIn" }}
        >
          <div className={styles.contenido}>
            <span />

            <h2 className={styles.etiqueta}>{nombre}</h2>

            <div className={styles.cifras}>
              <span className={styles.cifra}>
                <BookOpen size={12} aria-hidden="true" />
                {numLibros} {numLibros === 1 ? "libro" : "libros"}
              </span>
              <span className={styles.cifra}>
                <Sigma size={12} aria-hidden="true" />
                {numDemostraciones}{" "}
                {numDemostraciones === 1 ? "demostración" : "demostraciones"}
              </span>
              <span className={styles.fecha}>
                {ultimaActualizacion
                  ? `Actualizada ${ultimaActualizacion}`
                  : "Sin contenido todavía"}
              </span>
            </div>
          </div>
        </motion.div>

        <div className={styles.lomo} aria-hidden="true" />
      </motion.div>
    </Link>
  );
}

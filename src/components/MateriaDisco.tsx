"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { recurso } from "@/lib/rutas";
import styles from "./MateriaDisco.module.css";

/** Duracion base de las transiciones, en segundos. */
const DUR = 0.2;
/** El disco acelera antes de navegar; lo justo para leerse. */
const DUR_ARRANQUE = 0.34;

interface Props {
  nombre: string;
  color: string;
  href: string;
  portada: string;
  numLibros: number;
  numDemostraciones: number;
}

export default function MateriaDisco({
  nombre,
  color,
  href,
  portada,
  numLibros,
  numDemostraciones,
}: Props) {
  const router = useRouter();
  const reducido = useReducedMotion();
  const [arrancando, setArrancando] = useState(false);

  function abrir(evento: React.MouseEvent<HTMLAnchorElement>) {
    // Respetar ctrl+clic y equivalentes: son "abrir en otra pestana".
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.button !== 0) {
      return;
    }
    evento.preventDefault();
    if (arrancando) return;

    if (reducido) {
      router.push(href);
      return;
    }

    setArrancando(true);
    setTimeout(() => router.push(href), DUR_ARRANQUE * 1000);
  }

  return (
    <Link
      href={href}
      onClick={abrir}
      className={styles.marco}
      style={{ ["--tono" as string]: color }}
    >
      <motion.div
        className={styles.plato}
        animate={{ rotate: arrancando ? 220 : 0 }}
        whileHover={reducido ? undefined : { scale: 1.04 }}
        transition={{
          rotate: { duration: DUR_ARRANQUE, ease: "easeIn" },
          scale: { duration: DUR, ease: "easeOut" },
        }}
      >
        {portada && (
          <Image
            src={recurso(portada)}
            alt=""
            fill
            className={styles.arte}
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}
        <div className={styles.surcos} />
        <div className={styles.brillo} />
        <div className={styles.eje} />
      </motion.div>

      <div className={styles.pie}>
        <span className={styles.nombre}>{nombre}</span>
        <span className={styles.cifras}>
          {numLibros} {numLibros === 1 ? "libro" : "libros"} ·{" "}
          {numDemostraciones}{" "}
          {numDemostraciones === 1 ? "demostración" : "demostraciones"}
        </span>
      </div>
    </Link>
  );
}

"use client";

import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.css";

/**
 * Interruptor de tema.
 *
 * No guarda estado propio: el texto del boton lo elige el CSS segun el
 * data-theme que next-themes fija en <html>. Eso evita el patron
 * "montado" con useEffect, que ademas la regla set-state-in-effect prohibe.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Cambiar entre modo claro y oscuro"
      className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
    >
      <span className={styles.enOscuro}>claro</span>
      <span className={styles.enClaro}>oscuro</span>
    </button>
  );
}

"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * next-themes inyecta un script sincrono en el <head> que fija data-theme
 * en <html> antes del primer pintado, asi que no hay parpadeo al recargar
 * ni desajuste de hidratacion (por eso <html> lleva suppressHydrationWarning).
 *
 * Se usa data-theme, y no una clase, para que los selectores del CSS sean los
 * mismos que ya usaban los componentes del logo.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}

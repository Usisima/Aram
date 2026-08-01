# Aram

Plataforma web para un blog de demostraciones matemáticas escritas en LaTeX.

La especificación completa está en [`.md`](.md).

## Cómo funciona

El sitio publicado es **estático**: no hay servidor, ni base de datos, ni
autenticación. `next build` genera HTML plano en `out/` y GitHub Pages lo
sirve.

El editor de LaTeX corre **sólo en local**, con `npm run dev`. Escribes ahí,
guardas en el proyecto, haces `git push`, y GitHub Actions reconstruye y
publica. Se publica exactamente lo que esté guardado en el repositorio.

Esto resuelve el problema de la vista privada sin montar login: el editor
nunca llega al sitio publicado, así que nadie más puede alcanzarlo.

```
editor local  →  archivos del proyecto  →  git push  →  Actions  →  Pages
```

**Publicado en:** https://usisima.github.io/Aram/

## Stack

| Capa | Elección | Estado |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, `output: "export"`) | listo |
| Estilos | Tailwind CSS v4 | listo |
| Matemáticas | KaTeX, renderizado al compilar | listo |
| Animación | Motion (Framer Motion) | listo |
| Iconos | Lucide | listo |
| Tema | next-themes (`data-theme` en `<html>`) | listo |
| Alojamiento | GitHub Pages vía GitHub Actions | listo |
| Editor | Monaco (`@monaco-editor/react`), sólo local | pendiente |

Sin base de datos, sin autenticación y sin almacenamiento externo: no hacen
falta en este modelo.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000/Aram
npm run build    # genera out/ (incluye chequeo de tipos)
npm run lint
```

El `basePath` es `/Aram` porque el sitio vive en una subruta de
`usisima.github.io`, así que en local las URLs también la llevan.

## Estructura

```
src/
  app/
    page.tsx                                   pantalla principal (intro animada)
    materias/page.tsx                          estantería de materias
    materias/[materia]/page.tsx                libros de la materia
    materias/[materia]/[libro]/page.tsx        demostraciones (Pills)
    materias/[materia]/[libro]/[demostracion]/ ficha completa
  components/
    MateriaLibro.tsx  una materia dibujada como libro físico
    Logo.tsx          el logo en SVG, reutilizable
    Intro.tsx         splash: el logo se dibuja trazo por trazo
    Latex.tsx         renderiza la fuente LaTeX con KaTeX
    Breadcrumbs.tsx   Materias / Materia / Libro / Demostración
    ThemeProvider.tsx
    ThemeToggle.tsx
  lib/
    types.ts          modelo de datos
    data.ts           contenido y rutas de la exportación estática
.github/workflows/
  pages.yml           construye y publica en cada push a main
```

Como no hay servidor, cada página tiene que conocerse al compilar: las rutas
dinámicas las enumera `generateStaticParams` a partir de `getRutasLibros` y
`getRutasDemostraciones`.

## Alcance de LaTeX

`Latex.tsx` renderiza fórmulas (`$...$`, `\[...\]`) y entornos de tipo teorema,
definición, lema y corolario con KaTeX. **No compila documentos LaTeX
completos**: no admite `\documentclass`, paquetes ni bibliografía. Para eso
haría falta TeX Live, que no cabe en un sitio estático.

## Pendiente

El editor: dos paneles al estilo Overleaf, Monaco a la izquierda y vista
previa a la derecha, escribiendo el contenido en archivos del proyecto. Vive
sólo en desarrollo y no se incluye en la exportación.

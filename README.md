# Aram

Plataforma web para un blog de demostraciones matemáticas escritas en LaTeX,
con la lectura pública separada de la edición privada.

La especificación completa está en [`.md`](.md).

## Stack

| Capa | Elección | Estado |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | listo |
| Estilos | Tailwind CSS v4 | listo |
| Matemáticas | KaTeX, renderizado en el servidor | listo |
| Animación | Motion (Framer Motion) | instalado, sin usar todavía |
| Editor | Monaco (`@monaco-editor/react`) | instalado, sin usar todavía |
| Tema | next-themes (`data-theme` en `<html>`) | listo |
| Base de datos | PostgreSQL | **sin decidir** |
| Autenticación | Auth.js o Clerk | **sin decidir** |
| Almacenamiento | Supabase Storage o S3 | **sin decidir** |

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (incluye chequeo de tipos)
npm run lint
```

## Estructura

```
src/
  app/
    page.tsx                                   pantalla principal (intro animada)
    materias/page.tsx                          cuadrícula de materias
    materias/[materia]/page.tsx                libros de la materia
    materias/[materia]/[libro]/page.tsx        demostraciones (Pills)
    materias/[materia]/[libro]/[demostracion]/ ficha completa
    editor/page.tsx                            pendiente
  components/
    Logo.tsx          el logo en SVG, reutilizable
    Intro.tsx         splash: el logo se dibuja trazo por trazo
    Latex.tsx         renderiza la fuente LaTeX con KaTeX (Server Component)
    Breadcrumbs.tsx   Materias / Materia / Libro / Demostración
    ThemeProvider.tsx
    ThemeToggle.tsx
  lib/
    types.ts          modelo de datos
    data.ts           datos de ejemplo en memoria
```

Las rutas siguen el flujo de navegación de la especificación, así que la URL
refleja la jerarquía completa:
`/materias/calculo/spivak/teorema-fundamental-del-calculo`.

## Decisiones pendientes

1. **Despliegue.** GitHub Pages sólo sirve archivos estáticos y ya no puede
   servir esta aplicación. El destino natural es Vercel.
2. **Alcance de LaTeX.** `Latex.tsx` renderiza fórmulas y entornos de tipo
   teorema con KaTeX, no compila documentos LaTeX completos. Si hacen falta
   `\documentclass`, paquetes y bibliografía, hay que montar un servicio aparte
   con TeX Live.
3. **Persistencia y autenticación.** El editor no puede construirse hasta que
   existan, porque compilar tiene que guardar y la ruta debe quedar cerrada al
   público.

Mientras tanto, `src/lib/data.ts` sirve datos de ejemplo en memoria. Sus
funciones ya son `async`, así que al entrar PostgreSQL las páginas no cambian.

# Aram

Sitio estático en HTML y CSS. Sin dependencias ni proceso de build.

## Flujo

```
index.html            Portada
  matematicas.html      Matemáticas
    materias.html         Materias
      libros.html           Libros de una materia
        libro.html            Un libro
          demostraciones.html
          ejercicios.html
          notas.html
```

De momento solo está cableada una rama de ejemplo (Cálculo I → Spivak). El
resto de materias y libros aparecen en gris, sin enlace, para que se vea la
forma de la jerarquía. Cuando haya contenido real conviene pasar el árbol a un
JSON y generar las páginas, en vez de seguir duplicando HTML.

## Intro

`assets/intro.js` dibuja el logo trazo por trazo sobre negro. Es autocontenido
(inyecta sus propios estilos), así que a una página le basta con incluirlo.

Se muestra **solo en la portada**, marcada con `data-intro` en el `<html>`:

| Situación                        | ¿Anima? |
| -------------------------------- | ------- |
| Recargar la portada              | Sí      |
| Entrar de cero (pestaña, enlace) | Sí      |
| Llegar desde otra página         | No      |
| Gesto de retroceso               | No      |

El resto de páginas incluyen el script igualmente: no muestran nada, pero
marcan la sesión, que es lo que permite distinguir "vengo de dentro del sitio"
de "acabo de llegar".

`index.html?intro` fuerza la animación siempre, para poder repetirla mientras
se ajusta. `logo.html` es el banco de pruebas, con botón de repetir.

## Ver en local

Abrir `index.html` en el navegador, o servirlo por HTTP:

```
python -m http.server 8000
```

## Publicar

El workflow `.github/workflows/pages.yml` sube la raíz del repo a GitHub Pages
en cada push a `main`. Hay que activarlo una vez en **Settings → Pages → Source →
GitHub Actions**.

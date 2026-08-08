# Aram

Sitio estático en HTML y CSS. Sin dependencias ni proceso de build. Pensado
para leerse en el teléfono: la hoja de estilos es *mobile-first* y las
pantallas grandes solo añaden holgura al final.

## Flujo

Una carpeta por nivel, y cada nivel con su índice. El camino de un archivo es
el mismo que el de la miga de pan de su página:

```
index.html                              Portada
  matematicas/                            Matemáticas
    matematicos/                            Índice de matemáticos
      euler.html                              Ficha de cada uno
    materias/                               Índice de materias, por semestres
      calculo1/                               Una materia
    libros/                                 Un libro, con lo escrito de él
      spivak.html
```

Los libros cuelgan de `libros/` y no de dentro de una materia porque **un libro
no es de una materia**: Spivak es bibliografía de Cálculo I y de Cálculo II, y
lo que se demuestre de él se lee en las dos. Cada materia dice cuáles usa y con
qué papel —básico o complementario—; el contenido es del libro.

Los enlaces se escriben desde la raíz del sitio y `generar.js` les pone los
`../` que hagan falta al escribir cada página. Dentro de un texto, un enlace a
una ficha se escribe `ficha:euler` y se resuelve al construir: así el texto no
queda atado a cómo estén ordenados los archivos.

Las páginas de contenido las escribe `generar.js` a partir de `contenido/`, y
`construir.js` les compone las fórmulas. Lo que aún no existe aparece en gris,
sin enlace, para que se vea la forma de la jerarquía.

## Temas

Dos versiones, con la misma foto tratada de dos maneras:

|         | Fondo                              | Logo   | Texto              |
| ------- | ---------------------------------- | ------ | ------------------ |
| Claro   | foto original (cielo pálido)       | negro  | `#16191d` s/`#fff` |
| Oscuro  | cielo a negro por umbral, mar igual| blanco | `#e6e8ec` s/`#000` |

Manda la preferencia del sistema; el botón de la esquina la pisa y guarda la
elección. Todo sale de variables CSS en `estilos.css` — incluida `--tinta`, que
es lo que hace que el logo de la intro cambie de color sin tocar JavaScript.

Las imágenes se generan desde `herramientas/originales/fondo.png`
(el original, intacto):

```
magick herramientas/originales/fondo.png -quality 82 assets/fondo-claro.webp
magick herramientas/originales/fondo.png -fuzz 22% -fill black -opaque white -quality 82 assets/fondo-oscuro.webp

# Fondo tenue de las páginas: desenfoque horneado y 420px de ancho. Va al
# 13-50% de opacidad, así que no hace falta más, y evita un filter en runtime.
magick assets/fondo-claro.webp  -resize 420x -blur 0x7 -quality 78 assets/velo-claro.webp
magick assets/fondo-oscuro.webp -resize 420x -blur 0x7 -quality 78 assets/velo-oscuro.webp
```

## Intro

`assets/intro.js` dibuja el logo trazo por trazo sobre la foto. Es
autocontenido (inyecta sus propios estilos), así que a una página le basta con
incluirlo. Se muestra **solo en la portada**, marcada con `data-intro`:

| Situación                        | ¿Anima? |
| -------------------------------- | ------- |
| Recargar la portada              | Sí      |
| Entrar de cero (pestaña, enlace) | Sí      |
| Llegar desde otra página         | No      |
| Gesto de retroceso               | No      |

El resto de páginas incluyen el script igualmente: no muestran nada, pero
marcan la sesión, que es lo que permite distinguir "vengo de dentro del sitio"
de "acabo de llegar". Mientras está en pantalla, el gesto de desplazar no hace
nada.

`index.html?intro` la fuerza siempre, para poder repetirla mientras se ajusta.
`herramientas/paginas/logo.html` es el banco de pruebas, con botón de repetir.

## Tipografía

El texto va en **GFS Artemisia**, convertida a `woff2` desde los OTF del
paquete de CTAN que está en `herramientas/originales/gfsartemisia/`:

```
python -c "
from fontTools.ttLib import TTFont
for src, dst in [('GFSArtemisia.otf','artemisia-400.woff2'),
                 ('GFSArtemisiaIt.otf','artemisia-400i.woff2'),
                 ('GFSArtemisiaBold.otf','artemisia-700.woff2'),
                 ('GFSArtemisiaBoldIt.otf','artemisia-700i.woff2')]:
    f = TTFont('herramientas/originales/gfsartemisia/opentype/'+src); f.flavor='woff2'
    f.save('assets/fuentes/'+dst)
"
```

Necesita `fontTools` y `brotli`. Cubre el castellano completo y el griego.

**Euler para las matemáticas no es viable**, y conviene dejarlo escrito para no
volver a intentarlo:

- El paquete `gfsartemisia/` no trae Euler. `gfsartemisia-euler.sty` solo hace
  `\RequirePackage{euler}` y toma las fuentes del paquete `euler` de CTAN, que
  son Type1 para LaTeX, sin tabla MATH y sin formato web.
- KaTeX no admite cambiar de fuente matemática: sus métricas de composición
  están calculadas para las suyas.
- MathJax 4 sí admite varios juegos (`newcm`, `tex`, `pagella`), pero **no hay
  ninguno de Euler**.

Si algún día se quiere algo más cercano en espíritu, el candidato es Pagella:
Euler y Palatino son ambas de Hermann Zapf, y Euler se compone tradicionalmente
con Palatino. Eso implicaría cambiar KaTeX por MathJax 4.

## Matemáticas

Se escriben con los delimitadores de siempre — `$$…$$` y `\[…\]` en bloque,
`$…$` y `\(…\)` en línea — y **se componen una sola vez**, no en cada visita:

```
node construir.js
```

Hay que ejecutarlo después de tocar cualquier fórmula. Deja el resultado escrito
en el propio HTML y guarda el original en un comentario alrededor:

```html
<!--m:$x^2$-->…html compuesto…<!--/m-->
```

Se puede volver a ejecutar cuantas veces haga falta: primero deshace lo que
compuso antes y luego recompone. Para editar una fórmula ya compuesta, se
cambia el TeX del comentario y se vuelve a pasar.

Así el navegador no carga KaTeX en absoluto: solo el CSS y sus fuentes. Antes
descargaba 275 KB de JavaScript y recomponía todas las fórmulas en cada página
que se abría; los archivos se cacheaban, pero el trabajo de composición se
repetía siempre.

KaTeX va vendorizado en `assets/katex/` y no servido desde un CDN: así el sitio
sigue funcionando sin red y sin depender de un tercero. El `.js` solo lo usa
`construir.js`; del resto, en el navegador se usan el CSS y las `woff2`.

Las ecuaciones largas se desplazan dentro de su caja en vez de ensanchar la
página.

## Cuadrícula

El fondo lleva una cuadrícula y los renglones caen sobre sus rayas. Para que eso
se sostenga, la interlínea *es* el lado de la celda (`--celda`) y todo el
espaciado vertical va en múltiplos suyos. Dos detalles que no son evidentes:

- `main` es una columna flex porque en flex **los márgenes no se colapsan**. Con
  colapso, el margen inferior de un bloque y el superior del siguiente se funden
  en el mayor de los dos, y entonces tocar uno no mueve nada.
- Las fórmulas en bloque miden lo que miden, así que descuadran lo que va
  debajo. Eso lo corrige `assets/rejilla.js` midiendo dónde empieza el bloque
  siguiente.

Si se toca el espaciado, hay que mantenerlo en múltiplos de `--celda` o el ritmo
se pierde.

## Ver en local

Abrir `index.html` en el navegador, o servirlo por HTTP:

```
python -m http.server 8000
```

## Publicar

El workflow `.github/workflows/pages.yml` sube la raíz del repo a GitHub Pages
en cada push a `main`. Hay que activarlo una vez en **Settings → Pages → Source →
GitHub Actions**.

## Qué se publica

GitHub Pages sirve la raíz del repositorio tal cual, así que **todo lo que esté
aquí acaba en internet**. El `.gitignore` deja fuera el material de trabajo —el
paquete de peinados, las piezas en `.qb`, los originales de la fuente y de la
foto— que suma unos 100 MB y no hace falta para leer nada. Lo compuesto a partir
de él sí se publica: está en `assets/`, y son 10 MB.

## Sin internet, y como aplicación

`manifest.json` y `sw.js` hacen que el sitio se pueda instalar y leer sin
conexión:

- **Instalable**: en Chrome, Edge y Android sale «Instalar»; en iOS, «Añadir a
  la pantalla de inicio». Se abre en su propia ventana, sin barra de
  direcciones.
- **Sin conexión**: al entrar la primera vez se guarda una copia de todo lo que
  hace falta para leer —las 142 páginas, los estilos, las fuentes, las fórmulas
  ya compuestas y los retratos—, unos 2 MB. La lista la escribe `generar.js` en
  `precache.json`, así que una materia o un matemático nuevos entran solos.
- **El motor 3D no se guarda de entrada**: pesa más que todo lo demás junto y
  solo lo necesita quien abre una ficha. Se guarda al usarlo por primera vez.
- Al reconstruir el sitio cambia la versión de la lista y el navegador vuelve a
  guardarlo todo, tirando la copia anterior.

Nada de esto funciona abriendo los archivos con `file://`: los navegadores no
permiten guardianes fuera de `http`. En local, cualquier servidor estático vale.

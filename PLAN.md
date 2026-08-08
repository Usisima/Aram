# Plan del sitio

Documento de trabajo: a dónde va Aram. El [README](README.md) cuenta lo que el
sitio **es** hoy; esto cuenta lo que **quiere ser**.

Las secciones 1 a 9 son el plan tal como se escribió. Los bloques marcados
**Nota** son observaciones añadidas al revisarlo contra el repositorio: qué ya
está hecho, qué chocaría con cómo está montado el sitio y qué haría falta
antes. No son parte del plan, son el contraste con la realidad del proyecto.

---

## Lo que ya existe

Conviene tenerlo delante para no planear dos veces lo mismo.

| Pieza | Estado |
|---|---|
| Flujo portada → matemáticas → materias → materia → demostraciones | hecho |
| Modo claro y oscuro | hecho (`assets/tema.js`) |
| Fórmulas en LaTeX | hecho, y **precompuestas** en la compilación (`construir.js`) |
| Animación de entrada de la portada | hecho (`assets/intro.js`) |
| Rejilla base y ritmo vertical | hecho (`assets/rejilla.js`) |
| Motor voxel en tiempo real, 8 modelos | hecho (`assets/voxel3d.js`, `herramientas/paginas/personaje.html`) |
| Teoría de Conjuntos, 31 demostraciones | hecho, generadas desde `contenido/conjuntos.js` |
| Bibliografía en carrusel, con el índice del libro desplegable en la propia materia | hecho |
| Matemáticos: 9 fichas y carrusel de caras | hecho, desde `contenido/matematicos.js` |
| Ejercicios y notas | **retirados del sitio a propósito** |
| Buscador, etiquetas, índices, novedades | no existe nada |
| Relaciones | solo entre matemáticos, a mano en los datos |

Dos cosas que el plan da por pendientes ya están: **modo claro/oscuro** y
**renderizado LaTeX** (§9). El LaTeX además va un paso más allá de lo que pide
el plan: no se renderiza en el navegador en cada visita, se compone al construir
y se sirve ya hecho.

---

## 1. Página principal (Inicio)

Centro del blog. Presenta el contenido disponible y las novedades.

- Encabezado con el nombre del proyecto.
- Barra de navegación.
- Breve presentación del objetivo del blog.
- Carrusel de contenido destacado.
- Últimas demostraciones publicadas.
- Últimos personajes agregados.
- Últimas materias incorporadas.
- Noticias matemáticas.
- Accesos rápidos a Materias.
- Pie de página con enlaces y créditos.

> **Nota — decidido después: la portada no es esto.**
> Lo de arriba describe la portada como centro de un blog de matemáticas. No va
> a serlo: es una **presentación personal**, y Matemáticas es una de las cosas
> que cuelgan de ella, junto a otras herramientas —reseñador de películas,
> repertorio musical, calculadoras gráficas— que son proyectos aparte y desde
> aquí solo se enlazan. Está en [FUNCIONES.md](FUNCIONES.md).
>
> Eso cambia a quién sirve cada bloque de esta sección: el carrusel destacado,
> las novedades y los accesos a Materias pertenecen a la página de
> **Matemáticas**, no a la portada. La portada se queda con quién firma y qué
> más hay.
>
> **Nota — las novedades necesitan fechas.**
> «Últimas demostraciones» no se puede calcular hoy: las proposiciones de
> `contenido/conjuntos.js` no llevan fecha. Un panel de novedades automático es
> una ordenación por fecha y nada más, pero el dato tiene que existir desde el
> principio: ponerlo luego obliga a inventar 31 fechas hacia atrás. Es el
> cambio más barato de hacer ahora y más caro de aplazar.
>
> **Nota — la portada tiene dueño.** La animación de entrada se reproduce en
> cada recarga de la portada y en ninguna otra situación, y eso está probado
> caso por caso. Meter carruseles y paneles ahí obliga a decidir qué se ve
> mientras el logo se dibuja. Lo más sencillo: que la intro siga siendo la
> portada, y que todo este contenido caiga en Matemáticas (§2), que ya es la
> sección principal.

---

## 2. Página de Matemáticas

Sección principal del sitio, organizada en bloques.

### Carrusel de matemáticos históricos

Cada tarjeta: modelo voxel animado, nombre, época, nacionalidad.

Euclides · Arquímedes · Isaac Newton · Leonhard Euler · Carl Friedrich Gauss ·
Bernhard Riemann · David Hilbert

> **Nota — un carrusel de modelos vivos no cabe.**
> Cada visor 3D es un contexto WebGL, y los navegadores cortan alrededor de los
> ocho o dieciséis por pestaña; además cada uno carga las animaciones (433 KB) y
> su modelo. Siete tarjetas animadas a la vez son siete contextos y un teléfono
> derritiéndose.
>
> La salida está ya montada a medias: en `herramientas/voxel` hay un horneador
> que renderiza un modelo a una rejilla de ángulos y fotogramas. **Tarjetas con
> sprite horneado, motor en vivo solo en la página individual.** El sprite se ve
> idéntico, pesa una fracción y no consume contexto ninguno.

### Carrusel de materias

Álgebra · Geometría · Cálculo diferencial · Cálculo integral · Álgebra lineal ·
Análisis real · Análisis complejo · Topología · Geometría diferencial · Teoría
de grupos · Teoría de números · Lógica matemática · Probabilidad · Estadística ·
Optimización · Ecuaciones diferenciales · Matemática discreta · Combinatoria

### Panel de novedades

Últimos teoremas · últimas demostraciones · nuevos libros · nuevos matemáticos ·
correcciones importantes · noticias.

---

## 3. Página individual de un matemático

### Encabezado

Modelo voxel grande animado en el centro. Debajo, el nombre completo y los
accesos a biografía, obras, teoremas, libros y artículos.

> **Nota — esto ya está construido.** `herramientas/paginas/personaje.html` es exactamente esa
> página: modelo centrado y grande, giro horizontal con el dedo, arrastre
> vertical corto hacia arriba, animaciones aleatorias a intervalos irregulares y
> fundido entre ellas. Cambiarle el `data-modelo` y el texto la convierte en la
> página de un matemático. El registro (`herramientas/voxel/registro.py`) genera
> variedad de caras, peinados, barbas y atuendos.
>
> Conviene que el modelo de cada matemático sea **determinista**: derivarlo del
> nombre, no elegirlo a mano ni al azar, para que Euler tenga siempre la misma
> cara entre dos compilaciones.

### Información personal

Dentro de una pill desplegable: nacimiento, fallecimiento, lugar de nacimiento,
nacionalidad, instituciones, área de investigación, discípulos, influencias.

### Aportes matemáticos

- **Teoremas** — enunciado y demostración.
- **Conjeturas** — resueltas y abiertas.
- **Libros** — portada, nombre, año.
- **Artículos científicos** — portada, nombre, año.
- **Relaciones** — otros matemáticos relacionados.

---

## 4. Página de una materia

Ejemplo: Álgebra Lineal. Contiene la bibliografía. Cada libro tiene página
propia: *Linear Algebra Done Right* → página del libro.

> **Decidido después: el libro NO tiene página propia.** La bibliografía se
> enseña en la materia, en un carrusel, y el índice de cada libro se despliega
> ahí mismo. Una página cuyo contenido entero era una lista de tres enlaces solo
> metía un salto más antes de lo que se venía a leer. Con eso, §5 queda sin
> objeto como página; su estructura de capítulos sigue valiendo como forma del
> índice desplegable.
>
> **Y los ejercicios y las notas se retiran del sitio.** Decisión propia, no
> falta de contenido: estaban escritos y funcionando. Lo que queda de una
> materia es su bibliografía y sus demostraciones.

---

## 5. Página de un libro

Información general, autor, año, índice.

Cada capítulo es una sección desplegable:

```
Capítulo 1
  Definiciones → Teoremas → Lemas → Corolarios → Ejemplos
  → Demostraciones → Ejercicios → Problemas propuestos
```

---

## 6. Teorema

Estructura uniforme, para navegar y mantener:

- Nombre.
- Enunciado formal.
- Notación utilizada.
- Demostración principal.
- Corolarios.

### Demostración

Hipótesis · resultado · estrategia de demostración · desarrollo paso a paso ·
observaciones.

> **Decisión tomada: una sola página para todas las demostraciones.** No se
> parte en páginas individuales. La estructura uniforme de §6 se aplica dentro
> de la página, a cada bloque.
>
> **Nota — y los números dicen que la página aguanta.** El archivo son 1,4 MB en
> disco, que asusta hasta que se mide lo que de verdad viaja: el HTML de KaTeX
> es repetitivo y se comprime a **42 KB en gzip y 15 KB en brotli**, un 97 %
> menos. GitHub Pages comprime. En descarga no hay problema ninguno.
>
> El plegado también está resuelto: las 31 van en `<details>` cerrados con la
> pastilla de `<summary>`, así que el navegador no maqueta lo que no está
> abierto. Medido a 420 px de ancho, la página monta 6229 px de alto, no los
> metros que cabría temer.
>
> Lo único que queda es el coste de construir el DOM: **35 981 elementos**,
> frente a 39 de una página normal del sitio. Hoy no molesta y no hay que tocar
> nada. Si al crecer el corpus llegara a molestar, la palanca **no** es partir la
> página, es no construir de golpe lo que está plegado: dejar el cuerpo de cada
> demostración en un `<template>` inerte y componerlo al abrir el `<details>`.
> Mismo archivo, misma navegación, mismas anclas.
>
> Conviene medirlo en un teléfono real antes de mover nada.
>
> El campo «estrategia de demostración» merece atención aparte: es lo que
> distingue un repositorio de enunciados de algo que se lee para aprender.

---

## 8. Sistema de relaciones internas

Convertir cada elemento en un nodo de conocimiento.

```
Materia → Libro → Capítulo → Definición → Lema → Teorema → Corolario
        → Demostración → Ejercicios
```

Y simultáneamente:

```
Matemático → Teorema → Libro → Artículo → Materia
```

Navegar entre autores, conceptos y bibliografía sin duplicar contenido.

> **Nota — esta es la pieza que sostiene todo el resto, y conviene hacerla
> primero.**
>
> Las dos jerarquías se cruzan: un teorema cuelga de un capítulo *y* de un
> matemático *y* de una materia. Escrito a mano en HTML, eso es duplicar cada
> teorema en tres sitios y que se desincronicen.
>
> El proyecto ya tiene la forma correcta a pequeña escala: `contenido/conjuntos.js`
> son datos, `generar.js` escribe las páginas. Generalizar eso a un **corpus** de
> entidades con identificador —materia, libro, capítulo, teorema, demostración,
> matemático— y dejar que el generador emita las páginas es lo que hace posible
> §8 sin duplicar nada. Boceto de la idea, no código a escribir todavía:
>
> ```
> teorema:  id · nombre · materia · libro · capítulo · autor
>           enunciado · notación · demostración · corolarios · fecha · etiquetas
> ```
>
> Con eso, casi todo §9 deja de ser trabajo nuevo y pasa a ser una consulta
> sobre el corpus:
>
> | Módulo de §9 | Sale de |
> |---|---|
> | Índice alfabético de teoremas | ordenar por `nombre` |
> | Índice alfabético de matemáticos | ordenar por `autor` |
> | Sistema de etiquetas | agrupar por `etiquetas` |
> | Árbol de ramas | agrupar por `materia` |
> | Panel de novedades (§1) | ordenar por `fecha` |
> | Red de relaciones | recorrer `autor` ↔ `teorema` |
> | Buscador global | un índice JSON emitido al construir |
>
> Hacer el corpus primero convierte siete módulos en siete consultas. Hacerlo
> después obliga a reescribir todas las páginas ya publicadas.

---

## 9. Funcionalidades adicionales recomendadas

- Buscador global por teoremas, definiciones, autores y libros.
- Sistema de etiquetas (Álgebra, Topología, Análisis…).
- Índice alfabético de matemáticos.
- Índice alfabético de teoremas.
- Árbol jerárquico de las ramas de las matemáticas.
- ~~Modo oscuro y claro~~ — ya está.
- ~~Renderizado de fórmulas mediante LaTeX~~ — ya está, y precompuesto.
- Visualizaciones interactivas con GeoGebra, gráficos 2D/3D y animaciones.
- Sistema de favoritos y marcadores.
- Historial de lectura.
- Sección de ejercicios con soluciones ocultables.
- Red de relaciones entre matemáticos, mostrando influencias y colaboraciones.

> **Nota — el buscador no necesita servidor.** El sitio es estático y se publica
> en GitHub Pages, así que no hay dónde ejecutar una búsqueda. Pero con el
> corpus se puede emitir un índice JSON al construir y buscar en el navegador,
> sin dependencias ni npm, como el resto del proyecto. Merece la pena que busque
> también **por símbolo** (∪, ∩, ⊆, ∖): es la forma natural de buscar una
> propiedad cuando no recuerdas su nombre.
>
> **Nota — GeoGebra rompe una regla del proyecto.** Es un incrustado externo:
> pide red ajena, no funciona sin conexión, y contradice el «sin dependencias»
> del README. Para figuras deterministas —diagramas de Venn, rectas, curvas— sale
> mejor **generarlas al construir** como SVG suelto, que pesa nada, se ve nítido
> a cualquier tamaño y hereda los colores de los dos temas. Dejar GeoGebra solo
> para lo que de verdad tenga que ser manipulable en vivo, si aparece.
>
> **Nota — favoritos e historial son del dispositivo.** Sin cuentas ni servidor,
> viven en `localStorage`: se pierden al cambiar de teléfono y no se comparten.
> Está bien, pero conviene decirlo en la interfaz para que nadie confíe en ellos.
>
> **Nota — la accesibilidad del movimiento ya está.** Lo di por pendiente al
> escribir esto y estaba equivocado: el sitio atiende `prefers-reduced-motion` en
> todo lo que se mueve. Con el ajuste puesto, el logo aparece dibujado sin
> animarse, las pastillas no entran escalonadas, los desplegables no hacen
> transición y el personaje se queda en una pose, girable a mano. Está en
> [FUNCIONES.md](FUNCIONES.md).

---

## Orden sugerido

El plan es grande y no dice por dónde empezar. Este orden evita rehacer trabajo:

1. **El corpus** (§8) — datos con identificador, fecha y etiquetas. Todo lo
   demás se apoya aquí, y hacerlo después obliga a reescribir lo publicado.
   *Medio hecho:* las fichas de matemáticos ya llevan `id`, `alta`,
   `relaciones` y `materias`; falta darles la misma forma a las demostraciones
   y a los libros.
2. ~~**Rellenar los huecos**~~ — resuelto de otra manera: el nivel *libro* dejó
   de ser una página y su índice se despliega dentro de la materia. Los
   ejercicios y las notas se retiraron del sitio por decisión propia, así que
   §5 y la parte de ejercicios de §9 quedan sin objeto.
4. ~~**Matemáticos** (§3)~~ — hecho: nueve fichas con modelo voxel en vivo,
   datos personales plegados, teoremas, conjeturas, obras y relaciones. El
   modelo de cada uno va fijado en los datos, que es determinista sin
   necesidad de derivarlo del nombre.
5. **Índices, etiquetas y novedades** (§9) — consultas sobre el corpus.
6. **Buscador** (§9) — índice JSON y búsqueda en el navegador.
7. **Carruseles** (§2) — el de matemáticos ya está, con retratos horneados.
   Falta el de materias, cuando haya más de una.
8. **Relaciones** (§8) — el grafo, que es lo que más contenido necesita para
   valer algo.

Pendiente de fontanería, sin relación con el plan: no hay nada commiteado
todavía, y GitHub Pages sigue sin activarse en Settings → Pages → Source →
GitHub Actions.

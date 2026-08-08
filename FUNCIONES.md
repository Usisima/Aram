## Qué es el sitio

La portada no es el índice de un blog de matemáticas: es una **presentación
personal**. Un resumen de quién soy y, colgando de ahí, las cosas que tengo
hechas. Matemáticas es una de ellas, no el centro.

Las demás son **herramientas aparte**, cada una con su propio proyecto: un
reseñador de las películas que he visto, un repertorio musical con mis gustos,
calculadoras gráficas, y lo que vaya saliendo. La portada solo las enlaza.

> **Nada de eso se construye en este proyecto.** Aquí se hace la parte de
> Matemáticas. Lo que la portada añade es el marco: quién firma y qué más hay.

## Navegación1

- La portada reparte hacia fuera; dentro de Matemáticas se baja por niveles, de
  lo general a lo concreto:

  ```
  Inicio ─── resumen personal
    │
    ├── Matemáticas ─────────────── este proyecto
    │     Matemáticos ───────────── ficha de cada uno
    │     Materias
    │       Teoría de Conjuntos ─── bibliografía + Demostraciones
    │
    ├── Reseñador de películas ──┐
    ├── Repertorio musical       ├─ proyectos aparte, solo enlazados
    └── Calculadoras gráficas ───┘
  ```

- Migas de pan en todas las páginas, con el camino completo y cada nivel
  enlazado.

## Materias

- **Todas tienen página, tengan contenido o no.** Antes salían en la lista
  apagadas y sin enlace; una materia sin enlace no dice si está vacía o si no
  existe. Entrando se lee de qué va y qué va a haber ahí.
- La lista dice de cada una su asunto en una línea y cuántas demostraciones
  lleva, o que aún no lleva ninguna.
- Una materia va en cinco secciones, siempre en el mismo orden:
  **definiciones, teoremas, ejercicios, libros y artículos**. Entre los teoremas y
  los ejercicios se cuela una sexta que no se escribe a mano —**demostraciones**—
  porque sale de los libros.
- **Cualquier enunciado puede llevar demostración**, no solo los teoremas: un
  lema, un corolario, una propiedad o una identidad se demuestran igual. Lo que
  decide cómo se enseña es si tiene algo debajo, no de qué tipo sea.
- Lo que tiene dos partes —un teorema con su demostración, un ejercicio con su
  resolución— se enseña como **una sola pastilla**: el enunciado es lo que se
  ve, y la demostración o la resolución es lo que se despliega debajo. No son
  dos entradas.
- Cualquiera de esas listas admite **divisores** en dos niveles: **capítulos** y
  **temas**. El capítulo es un título fijo —enseña siempre lo que lleva dentro—
  y los temas que cuelgan de él se pliegan uno a uno. Son tres listas distintas
  y no se mezclan: el tema de la materia, el capítulo del libro y el tema del
  libro.
- Cada entrada puede llevar una **etiqueta** puesta a mano —«P1», «Teorema
  1.4»— para numerarla como se quiera. Va delante del nombre, que es por donde
  se busca.
- El mismo resultado demostrado en dos libros se puede **enlazar**, y entonces
  cada uno enseña un «también en» que lleva al otro. Los enlaces se marcan a
  mano y solo así: dos teoremas con el mismo título no tienen por qué ser el
  mismo, y un enlace adivinado manda a leer la demostración de otra cosa.
- Lo que sale de un libro se escribe **una vez**, dentro de ese libro, y de ahí
  puede **subir a la sección general** de la materia o quedarse solo en su
  libro. La general no guarda una copia: guarda una **referencia** al original,
  así que corregir el enunciado, la demostración o la etiqueta lo cambia en las
  dos páginas a la vez. Con copias, corregir una dejaba a la otra mintiendo.
- El **orden de la sección general no es el de los libros**: lo fija la materia
  con su propia lista, divisores incluidos. Lo que esté marcado y no aparezca en
  ella se añade al final, para que marcar una no obligue a acordarse de dos
  sitios.
- Una materia enseña también su **bibliografía**, en dos carruseles: la
  **básica** y la **complementaria**. Van separadas porque no se usan igual: de
  una se estudia y a la otra se acude.
- **Un libro no es de una materia.** Spivak es bibliografía de Cálculo I y de
  Cálculo II, y lo que se demuestre de él se lee igual desde las dos: el libro
  se escribe una vez y las materias solo dicen cuáles usan y con qué papel. El
  mismo libro puede ser básico en una y complementario en otra sin que eso toque
  lo que lleva dentro. Su página dice de qué materias es bibliografía.
- **Cada libro tiene su página**, y se abre tocando su portada. Dentro están sus
  demostraciones, y cada una dice si sube también a la sección general de la
  materia o si se queda solo ahí.
- Debajo, el contenido de la materia: las demostraciones.
- Los libros aún sin escribir salen en el carrusel, apagados y sin abrir.

## Animación de entrada

- El logo se dibuja trazo a trazo y después entra el nombre.
- Se reproduce **cada vez que se recarga** la portada.
- **No** se reproduce al llegar desde otra página del sitio, ni al volver con el
  gesto de retroceso.
- Se puede forzar añadiendo `?intro` a la dirección.
- Mientras dura, la página queda bloqueada y no se desplaza.

## Temas claro y oscuro
- Botón en la esquina para alternar entre los dos.
- Al entrar por primera vez usa el tema del sistema; a partir de ahí recuerda la
  elección entre visitas.
- Cada tema tiene su propia versión de la fotografía de la pantalla de entrada,
  no es la misma con un filtro encima.

## Paletas

Todo el color del sitio sale de estas dos listas. No hay ni un color suelto
repartido por ahí: cambiar un valor aquí lo cambia en todas las páginas a la
vez, y por eso los dos temas van siempre a la par.

Cada nombre dice **para qué sirve** el color, no de qué color es. Así el tema
oscuro no es el claro invertido, sino otra elección para el mismo papel.

Los dos temas son blanco y negro sin más color: lo que distingue una cosa de la
siguiente es el valor, no el tono.

### Claro

| Papel | Color | Dónde se ve |
|---|---|---|
| Fondo | #e8e8e8 | el papel de toda la página; es el gris del cielo de la fotografía de entrada, muestreado de ella |
| Papel | #f7f7f7 | recuadros y pastillas, un punto más claro que el fondo |
| Texto | #000000 | la lectura |
| Tenue | #595959 | subtítulos, notas al pie de una tarjeta |
| Apagado | #8c8c8c | lo que está pendiente y no lleva a ningún sitio |
| Línea | #cccccc | separadores y el borde de los recuadros |
| Acento | #000000 | enlaces y títulos |
| Franja | #d6d6d6 | el escalón con el nombre al pie de cada tarjeta |
| Cielo | #e8e8e8 | el cielo de la fotografía de entrada |
| Mar | #000000 | el mar de la fotografía de entrada |
| Tinta | #000000 | el trazo del logo mientras se dibuja |
| Rejilla | negro al 8 % | la cuadrícula del fondo |

### Oscuro

| Papel | Color | Dónde se ve |
|---|---|---|
| Fondo | #000000 | el papel de toda la página |
| Papel | #000000 | recuadros y pastillas: se distinguen por su línea, no por su fondo |
| Texto | #ffffff | la lectura |
| Tenue | #a6a6a6 | subtítulos, notas al pie de una tarjeta |
| Apagado | #737373 | lo que está pendiente y no lleva a ningún sitio |
| Línea | #404040 | separadores y el borde de los recuadros |
| Acento | #ffffff | enlaces y títulos |
| Franja | #1c1c1c | el escalón con el nombre al pie de cada tarjeta |
| Cielo | #000000 | el cielo de la fotografía de entrada |
| Mar | #ffffff | el mar de la fotografía de entrada |
| Tinta | #ffffff | el trazo del logo mientras se dibuja |
| Rejilla | blanco al 10 % | la cuadrícula del fondo |

La franja del nombre va al revés que el resto: gris claro sobre el tema blanco y
gris oscuro sobre el negro. Es lo único que separa la bandera del texto.

El color que las páginas declaran para la barra del navegador es el del fondo de
cada tema, así que en el teléfono no se ve una franja que desentone.

## Lectura

- Cuadrícula de fondo sobre la que se apoyan los renglones, los recuadros y los
  bloques: el texto cae siempre sobre sus líneas.
- La columna de lectura mide un número entero de celdas y empieza justo sobre
  una raya, así que lo que lleva dentro —tarjetas, portadas de libro, el visor
  del personaje— encaja en la cuadrícula en vez de cortarla. Lo que sobra del
  ancho de la pantalla se reparte a partes iguales entre los dos lados.
- Los recuadros de enunciado van por el centro de la celda, arriba y abajo:
  miden celdas enteras de borde a borde.
- La página se maqueta al ancho real del teléfono, no a un ancho fijo que
  luego se reduce: el texto se ve al tamaño que tiene, no a un tercio de él.
- Matemáticas dentro del texto y en bloque aparte.
- Una fórmula más ancha que la pantalla se desplaza dentro de su propio
  recuadro, sin ensanchar la página.
- Al tocar no aparece el recuadro azul de selección del navegador.

## Demostraciones

- Cada una en su pastilla: icono de disco a la
  izquierda, la proposición como título y su nombre debajo
- Numeración automática: añadir o quitar una no obliga a renumerar el resto.
- Se abren y se cierran ahí mismo, sin cambiar de página ni perder la lista.
- Al abrir una, la dirección pasa a apuntar a ella: ese enlace se puede copiar y
  compartir, y quien lo abra la encuentra ya desplegada.
- Una pastilla aparte, fuera de la numeración, con las definiciones de las
  operaciones.
- Las pastillas entran escalonadas al cargar la página.

## Matemáticos

- 47 fichas, de Tales de Mileto a Erdős: la Antigüedad griega, la India y
  Persia medievales, el duelo italiano por la cúbica, los siglos XVII y XVIII
  europeos y el XX de la lógica y la computación.
- Cada tarjeta lleva el retrato, el nombre, la época y, **de fondo, la bandera
  del país del que es originario**. La procedencia no se escribe: la dice la
  bandera. La nacionalidad con su detalle histórico —Prusia, Hannover, Magna
  Grecia— sigue estando dentro, en los datos personales.
  - **Cada uno tiene su propio modelo**, con el peinado, la barba, el color de
    pelo y el atuendo que se le conocen por sus retratos: Newton con la melena
    ya cana y sin barba, Riemann con barba cerrada y oscura, Hilbert calvo y con
    su perilla, Euclides y Arquímedes con túnica y barba larga.
  - Los del XVII y el XVIII llevan **peluca o media melena**, como en sus
    retratos: Leibniz con su peluca de bucles hasta el pecho, Newton con la
    melena cana, Descartes con el pelo negro largo, Lagrange con la coleta.
  - El color de ojos **no es un dato**: no está documentado en ninguno de
    ellos. Es una elección, y está dicho así donde se define.
  - Faraday no era matemático —era físico y químico, y apenas usaba álgebra—.
    Está por lo que hizo posible, y su ficha lo dice.
  - El retrato es la cabeza **en tres cuartos y en perspectiva**, no de frente:
    de frente la cara es un rectángulo con dos ojos y no se le ve el bulto.
  - Todos los retratos se toman **a la misma distancia y apuntando al mismo
    punto del esqueleto**, así que un vóxel mide lo mismo en todos y la cara
    cae siempre a la misma altura: mismo zoom y mismo encuadre, aunque uno
    lleve melena y otro barba hasta el pecho.
  - Por abajo la imagen se **desvanece** en vez de cortarse, y el nombre entra
    justo debajo sin línea que los separe.
  - Todas las tarjetas miden lo mismo, dure el nombre una línea o tres.
  - La bandera va rebajada y desvaída, no a todo color: es una marca para
    reconocerlo de un vistazo, no un cromo.
  - Euclides y Arquímedes son de sitios que no tuvieron bandera; llevan la de
    Grecia y la de Italia, que es un anacronismo asumido.
- **Carrusel** en la página de Matemáticas: unas cuantas caras que se pasan con
  el dedo a lo ancho. Es un asomo, no la lista.
- **Índice aparte**, en su propia página: las mismas tarjetas, tumbadas y
  apiladas hacia abajo, con todas a la vista sin arrastrar nada. Van **ordenadas
  por país** —los de un mismo sitio, seguidos— pero en una sola cuadrícula
  continua, sin partir la página en secciones: la bandera de fondo ya dice de
  dónde es cada uno.
- **Buscador** por nombre, país o época, que filtra las tarjetas ahí mismo.
- Cada ficha reúne:
  - el modelo tridimensional animado, grande y centrado;
  - la biografía;
  - los datos personales, plegados —nacimiento, fallecimiento, instituciones,
    área, maestros, discípulos, influencias—;
  - los **aportes** que se le hayan firmado desde el taller. Ya no se escriben
    aparte en la ficha: un aporte se escribe una vez, en su materia, y elegir a
    alguien como **autor** es lo que lo cuelga de su página. La ficha enseña los
    tres primeros; si hay más, al pie sale un «Ver los N aportes» que abre la
    página completa de esa persona. La ficha es una presentación, no un
    compendio: una columna de recuadros dejaba la bibliografía y las relaciones
    fuera de alcance;
  - las conjeturas, separadas en abiertas y resueltas;
  - los libros y los artículos, con su año;
  - las relaciones con otros matemáticos, como caras enlazadas.

## Personaje tridimensional

- El modelo se dibuja en el momento, en tres dimensiones: no es un vídeo ni una
  secuencia de imágenes.
- **Giro horizontal completo** arrastrando de lado.
- **Vista vertical:** se arrastra hacia abajo para verlo desde arriba. Hacia
  arriba se detiene de frente, sin llegar a mirarle las suelas.
- Encadena animaciones solo, a intervalos irregulares: pasa más tiempo quieto
  que gesticulando y no repite la misma dos veces seguidas.
- Entre una animación y la siguiente hay una transición suave, sin saltos.
- No se sale del cuadro en ningún ángulo ni con ninguna animación.
- El modelo es macizo: al separarse las piezas no se ve hueco por dentro.
- Tiene manos con dedos, y los dedos se mueven.

## En el teléfono

- Pensado primero para el teléfono; en pantallas grandes solo se añade holgura.
- Ninguna página se desplaza a lo ancho.
- Los enlaces de las listas tienen un área de toque cómoda, nunca menor que lo
  que abarca un dedo.


## Independencia

- No necesita instalar nada ni conectarse a ningún servicio externo.
- Las fórmulas llegan ya compuestas: no se recalculan en cada visita.
- Todo lo que la página usa —tipografías, imágenes, modelos— va dentro del
  propio sitio.

## Sin internet

- El sitio **se puede instalar** como aplicación y **se lee sin conexión**: la
  primera visita guarda una copia de las páginas, los estilos, las fuentes, las
  fórmulas ya compuestas y los retratos.
- Todo lo que se pliega —una demostración, un tema— **se abre creciendo**, no de
  golpe: la lista no pega un salto y no hay que volver a buscar por dónde se iba
  leyendo.

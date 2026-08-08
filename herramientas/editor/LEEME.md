# Taller

Editor visual en su propia ventana: modelos de los personajes y aportes.

    taller.cmd            (doble clic en la raíz del proyecto)

Levanta `servidor.js` en el 8899 y abre Chromium en modo aplicación —sin barra
de direcciones ni pestañas—. Si no está el Chromium de Playwright, usa Edge.

## Qué hace cada parte

**Voxel.** La lista de la izquierda son los 47 personajes. Se toca una pieza del
catálogo o un color y el modelo se recompone de verdad —lo hace `build_model.py`,
el mismo que usa el sitio— y se dibuja en el visor. Se arrastra para girar y la
rueda acerca. Nada se escribe hasta darle a *Guardar personaje*.

El catálogo trae las 132 piezas de pelo, 23 barbas, 20 atuendos y 8 caras, con
su miniatura. El número de la esquina de un peinado es cuánto tapa de la nuca:
en rojo, los que dejan hueco —el problema que tenía Weierstrass—.

Los colores se eligen con el selector, y entonces los tres tonos del material
—brillo, medio y sombra— salen del que se elija. El desplegable de al lado
vuelve a las paletas del juego.

**Aportes.** Un teorema con su autor, su ruta —materia, tema, capítulo— y su
enunciado en LaTeX, con vista previa en KaTeX según se escribe. Al guardar va a
`contenido/aportes.json`, y `generar.js` lo mete en la sección de aportes de
quien lo firma, con la ruta debajo.

**Materias.** El campo *materia* de un aporte ofrece las que hay en el sitio —no
una lista escrita aparte que se queda vieja— y el botón `+ crear` da de alta la
que esté escrita: sale vacía, con su página diciendo que aún no hay nada, y ya
se puede usar como ruta. Va a `contenido/materias.json`, que `materias.js`
mezcla con las suyas; cuando se le escriba contenido se le pone en el `.js`, que
manda sobre el JSON.

## Dónde acaba cada cosa

    personajes  ->  herramientas/voxel/personajes.json   (lo lee registro.py)
    modelos     ->  assets/voxel3d/modelos/<id>.json     (lo dibuja el sitio)
    aportes     ->  contenido/aportes.json               (lo lee generar.js)
    materias    ->  contenido/materias.json              (lo lee materias.js)

El editor no escribe código: ni el .py de los personajes ni el .js del
contenido. Escribe datos, y los generadores de siempre los recogen. Una
cacharreada en la ventana no puede dejar el sitio sin compilar.

## Lo que falta

**El contenido escrito de una materia no se edita desde aquí.** Las
definiciones, los teoremas y las demostraciones que están en
`contenido/materias.js` —con su LaTeX y sus divisores— se ven en el sitio y el
taller los cuenta al elegir la materia, pero para tocarlos hay que abrir ese
archivo. El taller solo escribe datos, y ese contenido vive en código; para
poder editarlo habría que sacarlo a JSON como se hizo con los personajes.
Mientras tanto, lo que se añade desde aquí son **aportes**, que sí caen en su
materia por la ruta.



La **cara de la tarjeta** no se rehace al guardar. Se intentó de dos maneras:
levantando un Chromium aparte por CDP —cada foto se quedaba colgada más de dos
minutos— y dibujándola en la propia ventana, que sale mal encuadrada porque aquí
la geometría va en coordenadas del modelo y no colgada de los pivotes del
esqueleto, así que la cabeza se ve desde arriba. Mientras tanto:

    node herramientas/voxel/retratos.mjs <todos los modelos>

que mide el lote y deja a todos al mismo zoom, y guarda esa distancia en
`distancia.json` para quien la necesite.

## Piezas

`catalogo.py` regenera el índice y las miniaturas cuando se añaden .qb nuevos:

    python herramientas/editor/catalogo.py

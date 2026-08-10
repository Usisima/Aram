/**
 * La portada: lo que dice el sitio de sí mismo.
 *
 * Estaba escrita a mano en `index.html`, que era la única página del sitio que
 * no salía del generador. Eso costaba caro cada vez que cambiaba el armazón —la
 * barra de abajo, un script, la cabecera—: había que acordarse de copiárselo, y
 * tres veces se quedó descolgada. Aquí es un dato más, como los matemáticos o
 * las materias, y la escribe `generar.js` con la misma plantilla que las otras
 * ciento cuarenta y tres.
 *
 * Se toca esto para cambiar lo que dice la portada. El HTML no se toca: se
 * vuelve a generar.
 */

const portada = {
  titulo: "Aram",
  entrada: "Apuntes, demostraciones y ejercicios.",
  /* A dónde reparte. De momento una, pero la portada existe para llevar a las
     cosas que haya, y aquí es donde se añaden. */
  puertas: [{ texto: "Matemáticas", href: "matematicas/index.html" }],
};

module.exports = { portada };

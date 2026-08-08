/**
 * Prepara assets/voxel3d/anims.json a partir del volcado completo.
 *
 *   node herramientas/voxel/preparar-anims.mjs
 *
 * El volcado de Stonehearth es DISPERSO: un hueso solo aparece en los
 * fotogramas en que su curva tiene una clave, y tres animaciones traen además
 * fotogramas enteros vacíos. El motor recorre los huesos en bucle y, si a uno
 * le faltaba su entrada, se quedaba con los valores del hueso anterior — un
 * dedo acababa con la orientación del pie, a treinta y cinco unidades del
 * cuerpo, y el encuadre se calculaba para contener esa basura.
 *
 * Aquí se rellenan los huecos: para cada hueso que la animación llega a mover,
 * todo fotograma sin clave se interpola entre las dos claves que lo rodean
 * (dando la vuelta al final, que las animaciones son cíclicas). Los huesos que
 * una animación no toca NUNCA se dejan fuera a propósito: de esos se encarga el
 * motor poniéndolos en reposo, que es lo que significa no tener curva.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");

/* Las que se publican: exactamente las del repertorio de personaje.html. El
   resto del volcado se queda aquí, en herramientas — cada animación son unos
   60 KB que el teléfono se descarga para nada. Añadir otra es meterla en esta
   lista y en el data-gestos de la página.
 *
 * Fuera queda `delighted` a propósito, por bonita que sea: el personaje pega un
 * salto y el torso sube de y≈10 a y≈25, con la mano a y≈51 en un modelo de 33
 * de alto. Como el encuadre se calcula para que no se corte NADA, esa sola
 * animación obligaba a alejar la cámara al doble y el resto del tiempo se veía
 * un personaje diminuto. Lo mismo `confetti`. */
const PUBLICADAS = [
  /* Reposos: lo que hace la mayor parte del tiempo. */
  "idle", "idle_sway", "idle_foottap", "idle_look", "happy_idle",
  /* Ánimo. */
  "laugh", "proud", "relieved",
  /* Conversación: asentir, negar, preguntar, encogerse de hombros. */
  "talk", "talk_yes", "talk_no", "talk_q", "talk_dunno", "talk_surprise",
  "talk_listen",
  /* Sueltas, muy reconocibles. */
  "wave", "count", "browwipe", "look_around2", "applaud", "fistpump",
  "yawn", "warm_hands",
  /* Baile. */
  "dance", "dance2", "monkey",
];

/* Cuatro decimales en el cuaternión son unas seis milésimas de grado, y tres en
   la posición son milésimas de vóxel: por debajo de lo que puede verse, y el
   archivo baja bastante al haber menos dígitos que comprimir. */
const red = (x, n = 4) => +x.toFixed(n);

/** Slerp por el camino corto; `q` viene como [w,x,y,z]. */
function slerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let c = b;
  if (d < 0) { d = -d; c = [-b[0], -b[1], -b[2], -b[3]]; }
  if (d > 0.9995) {
    const r = a.map((v, i) => v + (c[i] - v) * t);
    const n = Math.hypot(...r);
    return r.map((v) => red(v / n));
  }
  const th0 = Math.acos(d), th = th0 * t;
  const s0 = Math.sin(th0), s1 = Math.sin(th0 - th) / s0, s2 = Math.sin(th) / s0;
  return a.map((v, i) => red(v * s1 + c[i] * s2));
}

const lerp = (a, b, t) => a.map((v, i) => red(v + (b[i] - v) * t, 3));

function densificar(anim, nombre) {
  const fs = anim.frames, N = fs.length;
  const huesos = new Set();
  for (const f of fs) for (const h of Object.keys(f)) huesos.add(h);

  let rellenados = 0;
  for (const h of huesos) {
    const tiene = [];
    for (let i = 0; i < N; i++) if (fs[i][h]) tiene.push(i);
    if (tiene.length === N) continue;
    if (tiene.length === 0) continue;

    for (let i = 0; i < N; i++) {
      if (fs[i][h]) continue;
      /* Clave anterior y siguiente dando la vuelta al ciclo. */
      let atras = 0;
      while (!fs[(i - atras + N * 2) % N][h]) atras++;
      let alante = 0;
      while (!fs[(i + alante) % N][h]) alante++;
      const a = fs[(i - atras + N * 2) % N][h], b = fs[(i + alante) % N][h];
      const t = atras + alante === 0 ? 0 : atras / (atras + alante);
      fs[i][h] = { q: slerp(a.q, b.q, t), d: lerp(a.d, b.d, t) };
      rellenados++;
    }
  }

  /* También se recorta lo que venía del volcado, no solo lo interpolado. */
  for (const f of fs)
    for (const h of Object.keys(f)) {
      f[h].q = f[h].q.map((v) => red(v));
      f[h].d = f[h].d.map((v) => red(v, 3));
    }

  const cuenta = fs.map((f) => Object.keys(f).length);
  return { nombre, huesos: huesos.size, rellenados, min: Math.min(...cuenta), max: Math.max(...cuenta) };
}

const fuente = JSON.parse(readFileSync(join(AQUI, "anims.json"), "utf8"));
const salida = { pivots: fuente.pivots, anims: {} };

console.log("anim".padEnd(15), "huesos", "rellenados", "huesos/frame");
for (const n of PUBLICADAS) {
  if (!fuente.anims[n]) { console.log(`${n}: NO ESTÁ en el volcado`); continue; }
  const a = fuente.anims[n];
  const info = densificar(a, n);
  salida.anims[n] = a;
  console.log(
    n.padEnd(15), String(info.huesos).padStart(6), String(info.rellenados).padStart(10),
    `      ${info.min}..${info.max}`,
  );
}

const destino = join(RAIZ, "assets", "voxel3d", "anims.json");
writeFileSync(destino, JSON.stringify(salida));
const kb = (readFileSync(destino).length / 1024).toFixed(0);
console.log(`\n${Object.keys(salida.anims).length} animaciones -> ${destino} (${kb} KB)`);

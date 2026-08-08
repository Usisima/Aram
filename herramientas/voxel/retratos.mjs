/**
 * Hornea el retrato de cabeza de cada modelo.
 *
 *   node herramientas/voxel/retratos.mjs [modelos...]
 *
 * Necesita el servidor estático en :8777 y un Chromium con --remote-debugging-port=9222
 * (WebGL por software vale: --enable-unsafe-swiftshader --use-angle=swiftshader).
 *
 * Escribe assets/voxel/<modelo>-cara.png. La conversión a webp va aparte, con
 * ImageMagick, para no meter aquí una dependencia de imagen.
 *
 * Son las caras de las tarjetas de matemáticos. Se hornean en vez de montar un
 * visor por tarjeta porque cada visor vivo es un contexto WebGL —el navegador
 * corta alrededor de los ocho— más las animaciones y el modelo. Ocho tarjetas
 * animadas fundirían el teléfono para enseñar ocho caras quietas.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "..", "..", "assets", "voxel");
const CDP = "http://localhost:9222";
const BASE = "http://localhost:8777/herramientas/voxel";
const LADO = 512;

const modelos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["v00", "v01", "v02", "v03", "v04", "v05", "v06", "v07"];

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const t = await (await fetch(`${CDP}/json/list`)).json();
const ws = new WebSocket(t.find((x) => x.type === "page").webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

let sig = 0;
const pend = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
});
const enviar = (m, p = {}) => {
  const id = ++sig;
  ws.send(JSON.stringify({ id, method: m, params: p }));
  return new Promise((r) => pend.set(id, r));
};
const evaluar = async (e) => {
  const m = await enviar("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
  if (m.result?.exceptionDetails)
    throw new Error(m.result.exceptionDetails.exception?.description?.split("\n")[0]);
  return m.result?.result?.value;
};

await enviar("Page.enable");
await enviar("Runtime.enable");
await enviar("Network.enable");
await enviar("Network.setCacheDisabled", { cacheDisabled: true });
await enviar("Emulation.setDeviceMetricsOverride", {
  width: LADO, height: LADO, deviceScaleFactor: 1, mobile: false,
});
/* Fondo transparente: el retrato se recorta redondo en la tarjeta. */
await enviar("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });

await enviar("Page.navigate", { url: `${BASE}/render.html?lado=${LADO}` });
for (let i = 0; i < 150; i++) {
  if ((await evaluar("document.readyState")) === "complete") break;
  await dormir(100);
}
await evaluar("window.__listo");

mkdirSync(SALIDA, { recursive: true });

/* Distancia de tanteo. Solo sirve de patrón para medir: de ella sale la buena,
   que es UNA para todos. */
const TANTEO = 50;

/** Caja en píxeles de la cabeza sola, a la distancia que se le pase. */
async function medirCabeza(modelo, distancia) {
  await evaluar(`window.__prepararModelo(${JSON.stringify(modelo)})`);
  /* Sin animación: en reposo el modelo está en la pose en que se dibujó, que
     es la que mejor sirve de retrato. */
  if (!(await evaluar(`window.__retrato({ distancia: ${distancia} })`))) return null;
  await evaluar("window.__soloCabeza(true)");
  const s = await evaluar("window.__silueta()");
  await evaluar("window.__soloCabeza(false)");
  return s;
}

/**
 * Una sola distancia para todos, y de ahí el mismo zoom.
 *
 * Lo que NO funciona es encuadrar cada cabeza para que llene el cuadro. Las
 * cabezas miden de catorce a diecisiete vóxeles según el peinado, así que
 * dejarlas todas del mismo alto en píxeles daba 16 px por vóxel en el melenudo
 * y 20 en el rapado: en pantalla son dos zooms distintos, y se nota.
 *
 * Fijando la distancia, un vóxel mide lo mismo en todos, que es la definición
 * de estar al mismo zoom. Lo único que queda por decidir es cuál, y se toma la
 * más corta —la que más acerca— que aún deja entera a la cabeza más aparatosa.
 */
const siluetas = {};
for (const m of modelos) {
  const s = await medirCabeza(m, TANTEO);
  if (!s) console.log(`${m}: sin hueso 'head'`);
  else siluetas[m] = s;
}

const mayor = Math.max(...Object.values(siluetas).flatMap((s) => [s.ancho, s.alto]));
/* Lo que llega a ocupar del cuadro la cabeza más grande. El resto es el aire
   que necesita una coleta o un ala de sombrero para no chocar con el canto. */
const LLENADO = 0.82;
const DISTANCIA = (TANTEO * mayor) / (LLENADO * LADO);

console.log(`cabeza mayor: ${mayor} px a la distancia de tanteo`);
console.log(`distancia comun: ${DISTANCIA.toFixed(2)}\n`);

/* Se deja escrita. El taller (herramientas/editor) hornea de uno en uno al
   guardar un personaje y no puede medir el lote: tiene que fotografiar a esta
   misma distancia o su tarjeta saldría a otro zoom que las demás. */
writeFileSync(
  join(AQUI, "distancia.json"),
  JSON.stringify({
    distancia: +DISTANCIA.toFixed(4),
    llenado: LLENADO,
    lado: LADO,
    modelos: Object.keys(siluetas).length,
  }),
);

for (const m of Object.keys(siluetas)) {
  await evaluar(`window.__prepararModelo(${JSON.stringify(m)})`);
  await evaluar(`window.__retrato({ distancia: ${DISTANCIA} })`);
  await dormir(60);
  const r = await enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(SALIDA, `${m}-cara.png`), Buffer.from(r.result.data, "base64"));
  console.log(`${m}-cara.png`);
}

ws.close();

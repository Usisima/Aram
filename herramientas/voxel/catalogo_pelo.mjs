/**
 * Hornea el catálogo de peinados.
 *
 *   node herramientas/voxel/catalogo_pelo.mjs
 *
 * Antes: python herramientas/voxel/catalogo_pelo.py modelos
 * Después: python herramientas/voxel/catalogo_pelo.py hoja
 *
 * Escribe herramientas/voxel/_catalogo/<modelo>.png, uno por peinado, todos a
 * la MISMA distancia de cámara para que un vóxel mida lo mismo en todos y las
 * casillas se puedan comparar.
 *
 * A diferencia de retratos.mjs, aquí no se mide cabeza por cabeza: son ciento
 * treinta y dos y la medición cuesta el doble que la foto. Se miden solo las
 * piezas más aparatosas —las que sobresalen más de la cabeza, calculado sobre
 * los vóxeles— y de la mayor sale la distancia para todas. El resultado es el
 * mismo: lo que fija el encuadre es siempre el peinado más grande.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(AQUI, "_catalogo");
const CDP = "http://localhost:9222";
const BASE = "http://localhost:8777/herramientas/voxel";
const LADO = 512;
/* Cuánto llena del cuadro el peinado más grande. Un poco más apretado que en
   los retratos de las fichas: aquí no hay tarjeta que recorte. */
const LLENADO = 0.88;
/* Lejos a propósito: a cincuenta, el peinado más aparatoso llenaba el cuadro y
   la silueta salía recortada —512 de 512—, así que la distancia que se deducía
   de ella se quedaba corta y ese mismo peinado volvía a salirse. Desde aquí no
   toca los cantos y la medida es la de verdad. */
const TANTEO = 95;
/* Cuántas de las más aparatosas se miden de verdad. */
const CANDIDATAS = 12;

const piezas = JSON.parse(readFileSync(join(AQUI, "_catalogo.json"), "utf8"));

/* Lo que sobresale cada peinado de la cabeza, mirando el modelo ya compuesto:
   el hueso 'head' lleva cara, cejas, ojos y pelo, así que su caja crece
   justamente con el peinado. */
const volumen = (nombre) => {
  const m = JSON.parse(readFileSync(join(AQUI, "modelos", `${nombre}.json`), "utf8"));
  const ih = m.bones.indexOf("head");
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const v of m.voxels) {
    if (v[4] !== ih) continue;
    if (v[0] < x0) x0 = v[0]; if (v[0] > x1) x1 = v[0];
    if (v[1] < y0) y0 = v[1]; if (v[1] > y1) y1 = v[1];
    if (v[2] < z0) z0 = v[2]; if (v[2] > z1) z1 = v[2];
  }
  return Math.max(x1 - x0, y1 - y0, z1 - z0);
};

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
await enviar("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
await enviar("Page.navigate", { url: `${BASE}/render.html?lado=${LADO}` });
for (let i = 0; i < 150; i++) {
  if ((await evaluar("document.readyState")) === "complete") break;
  await dormir(100);
}
await evaluar("window.__listo");
mkdirSync(SALIDA, { recursive: true });

const nombres = piezas.map((p) => `cat_${p.nombre}`);
const grandes = nombres
  .map((n) => [n, volumen(n)])
  .sort((a, b) => b[1] - a[1])
  .slice(0, CANDIDATAS)
  .map(([n]) => n);

let mayor = 0;
for (const n of grandes) {
  await evaluar(`window.__prepararModelo(${JSON.stringify(n)})`);
  if (!(await evaluar(`window.__retrato({ distancia: ${TANTEO} })`))) continue;
  await evaluar("window.__soloCabeza(true)");
  const s = await evaluar("window.__silueta()");
  await evaluar("window.__soloCabeza(false)");
  if (s) mayor = Math.max(mayor, s.ancho, s.alto);
  if (s && (s.ancho >= LADO || s.alto >= LADO))
    console.log(`AVISO: ${n} llena el cuadro al tantear; la medida sale corta`);
}
const DISTANCIA = (TANTEO * mayor) / (LLENADO * LADO);
console.log(`la mayor de ${grandes.length} candidatas: ${mayor} px`);
console.log(`distancia comun: ${DISTANCIA.toFixed(2)}\n`);

let n = 0;
for (const nombre of nombres) {
  await evaluar(`window.__prepararModelo(${JSON.stringify(nombre)})`);
  await evaluar(`window.__retrato({ distancia: ${DISTANCIA} })`);
  await dormir(50);
  const r = await enviar("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(SALIDA, `${nombre}.png`), Buffer.from(r.result.data, "base64"));
  n++;
}
console.log(`${n} retratos en ${SALIDA}`);

ws.close();

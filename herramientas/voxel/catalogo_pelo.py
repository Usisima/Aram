"""Catálogo de peinados: el mismo personaje con todos los pelos disponibles.

    python herramientas/voxel/catalogo_pelo.py modelos   -> uno por peinado
    node   herramientas/voxel/catalogo_pelo.mjs          -> los horneA
    python herramientas/voxel/catalogo_pelo.py hoja      -> junta la lámina

Sirve para elegir peinado viéndolo PUESTO, que es distinto de verlo suelto:
hoja_piezas.py proyecta la pieza sola y en dos segundos, y va bien para
descartar, pero no dice cómo le queda a una cabeza ni cuánto tapa la cara.

Todos los modelos son el mismo personaje —mismo cuerpo, mismo atuendo, misma
cara y mismo color de pelo— para que lo único que cambie de una casilla a otra
sea el peinado.

Las piezas salen del paquete cy_hairstyles/ y del juego base. Cuando un nombre
está en los dos lados del paquete se toma el masculino, que es el tallado para
esta cabeza; los que solo existen en el lado femenino se suben dos vóxeles,
porque están hechos para una cabeza dos más baja y si no dejan la coronilla al
aire (ver SUBIR_FEMENINO en registro.py).
"""

from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(AQUI))

import build_model
from build_model import compose
from qb_parser import parse_qb

PACK = AQUI / "cy_hairstyles" / "entities" / "humans"
MODELOS = AQUI / "modelos"
CARAS = AQUI / "_catalogo"
LAMINA = AQUI / "catalogo-pelo.png"

# El personaje de referencia. Carpenter porque no lleva gorro; pelo castaño y
# piel clara porque es donde mejor se lee la silueta del peinado.
BASE = dict(sexo="m", oficio="carpenter", cara="m_head",
            piel="white", color="brown", ojos="marron")
SUBIR_FEMENINO = 2

# No son peinados.
NO_PELO = ("beard", "chops", "moustache")


def catalogo() -> list[dict]:
    """Cada peinado disponible: de dónde sale y si hay que subirlo."""
    piezas: dict[str, dict] = {}

    # Juego base, en qb/. Los f_hair_* son del lado femenino igual que los del
    # paquete: mismo problema de altura, misma solución.
    for p in sorted((AQUI / "qb").glob("*hair*.qb")):
        if any(k in p.stem for k in NO_PELO):
            continue
        piezas[p.stem] = dict(nombre=p.stem, ruta=p, alza=SUBIR_FEMENINO if p.stem.startswith("f_") else 0,
                              origen="juego")

    # Paquete: primero el lado femenino y encima el masculino, que es el que
    # manda cuando el nombre está en los dos.
    for lado, alza in (("female", SUBIR_FEMENINO), ("male", 0)):
        for p in sorted((PACK / lado).glob("*.qb")):
            if any(k in p.stem for k in NO_PELO):
                continue
            piezas[p.stem] = dict(nombre=p.stem, ruta=p, alza=alza, origen=lado)

    return sorted(piezas.values(), key=lambda d: d["nombre"].lower())


def color_propio(ruta: Path) -> float:
    """Qué parte de la pieza NO lleva color de marcador, de 0 a 1.

    Lo que no lo lleva se queda con el color pintado en la pieza y no obedece al
    color de pelo del personaje. Casi todas traen dos o tres vóxeles así —el
    cierre de una coleta, una horquilla— y eso da igual; lo que importa es
    distinguir la que lleva un adorno de la que viene entera de otro color, como
    las de tipo cevio o kemu, que salen rosas o blancas se ponga lo que se ponga.
    """
    marc = {build_model.hx(c) for c in build_model.HAIR_PH}
    vox = parse_qb(str(ruta))[0]
    if not vox:
        return 0.0
    return sum(1 for v in vox if (v[3], v[4], v[5]) not in marc) / len(vox)


# Por debajo de esto es un remache suelto y no se dice nada; por encima del
# segundo, la pieza trae su propio color y el del personaje no pinta nada.
ADORNO, FIJO = 0.02, 0.8


def generar() -> list[dict]:
    piezas = catalogo()

    # Un directorio con todo junto: compose lee las capas de una sola carpeta.
    tmp = Path(tempfile.mkdtemp(prefix="catalogo-pelo-"))
    for p in (AQUI / "qb").glob("*.qb"):
        shutil.copy2(p, tmp / p.name)
    for pieza in piezas:
        shutil.copy2(pieza["ruta"], tmp / f"{pieza['nombre']}.qb")

    build_model.QB = tmp
    build_model.SALIDA = MODELOS
    MODELOS.mkdir(exist_ok=True)

    hechos = []
    for pieza in piezas:
        n = pieza["nombre"]
        capas = [
            f"{BASE['sexo']}_body.qb",
            f"o_{BASE['oficio']}_{BASE['sexo']}.qb",
            f"{BASE['cara']}.qb",
            f"{BASE['sexo']}_eyes.qb",
            "m_brows.qb",
            (f"{n}.qb", pieza["alza"]) if pieza["alza"] else f"{n}.qb",
        ]
        try:
            compose(capas, BASE["piel"], BASE["color"], f"cat_{n}", BASE["ojos"])
        except Exception as e:
            print(f"  {n}: FALLA {type(e).__name__}: {e}")
            continue
        pieza["propio"] = round(color_propio(pieza["ruta"]), 3)
        hechos.append(pieza)

    shutil.rmtree(tmp, ignore_errors=True)
    (AQUI / "_catalogo.json").write_text(
        json.dumps([{k: v for k, v in p.items() if k != "ruta"} for p in hechos], ensure_ascii=False),
        encoding="utf-8")
    print(f"\n{len(hechos)} peinados -> {MODELOS}/cat_*.json")
    return hechos


def hoja() -> None:
    """Junta los retratos horneados en una sola lámina con sus nombres."""
    from PIL import Image, ImageDraw, ImageFont

    def letra(tam: int):
        """Una tipografía de verdad: la de serie no tiene acentos y en el
        título dejaba «CATÁLOGO» con un cuadrado en medio."""
        for f in ("segoeui.ttf", "arial.ttf", "calibri.ttf"):
            try:
                return ImageFont.truetype(f, tam)
            except OSError:
                continue
        return ImageFont.load_default()

    piezas = json.loads((AQUI / "_catalogo.json").read_text(encoding="utf-8"))
    tiles = [(p, CARAS / f"cat_{p['nombre']}.png") for p in piezas]
    tiles = [(p, r) for p, r in tiles if r.exists()]

    LADO, PIE, COLS, CABEZA = 170, 30, 8, 56
    filas = (len(tiles) + COLS - 1) // COLS
    fondo, tinta, tenue, aviso = (245, 245, 245), (20, 20, 20), (130, 130, 130), (150, 60, 40)
    f_titulo, f_nota, f_nombre, f_pie = letra(19), letra(12), letra(12), letra(11)

    lamina = Image.new("RGB", (COLS * LADO, CABEZA + filas * (LADO + PIE)), fondo)
    d = ImageDraw.Draw(lamina)
    d.text((12, 10), f"Catálogo de peinados · {len(tiles)} piezas sobre el mismo personaje",
           fill=tinta, font=f_titulo)
    d.text((12, 34), "sube: pieza del lado femenino, subida 2 vóxeles   ·   "
                     "adorno: lleva algún vóxel de color propio   ·   "
                     "color fijo: no obedece al color de pelo",
           fill=tenue, font=f_nota)

    for i, (p, ruta) in enumerate(tiles):
        x, y = (i % COLS) * LADO, CABEZA + (i // COLS) * (LADO + PIE)
        cara = Image.open(ruta).convert("RGBA").resize((LADO, LADO), Image.LANCZOS)
        casilla = Image.new("RGB", (LADO, LADO), fondo)
        casilla.paste(cara, (0, 0), cara)
        lamina.paste(casilla, (x, y))

        propio = p.get("propio", 0)
        marcas = []
        if p["alza"]:
            marcas.append("sube")
        marcas.append(p["origen"])
        if propio >= FIJO:
            marcas.append("COLOR FIJO")
        elif propio >= ADORNO:
            marcas.append("adorno")
        d.text((x + 5, y + LADO + 2), p["nombre"], fill=tinta, font=f_nombre)
        d.text((x + 5, y + LADO + 16), " · ".join(marcas),
               fill=aviso if propio >= FIJO else tenue, font=f_pie)

    lamina.save(LAMINA)
    print(f"{LAMINA}  ({lamina.size[0]}x{lamina.size[1]})")


if __name__ == "__main__":
    orden = sys.argv[1] if len(sys.argv) > 1 else "modelos"
    if orden == "hoja":
        hoja()
    else:
        generar()

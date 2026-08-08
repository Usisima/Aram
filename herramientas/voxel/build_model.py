"""Compone un hearthling con el SISTEMA REAL de Stonehearth (no inventado).

Los .qb traen colores "placeholder" (magenta el pelo, verde los ojos,
tonos piel) que el juego remapea a materiales con una paleta concreta,
por cada ciudadano.  Aqui replicamos ese remapeo con los valores reales
extraidos de:
  data/materials/color_maps/{hair,skin,eyes}_color_map.json
  data/materials/material_maps/hair_*.json, skin_*.json

Cada ciudadano = piel aleatoria + color de pelo aleatorio + peinado,
igual que Stonehearth.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from qb_parser import parse_qb, parse_qb_bones

ROOT = Path(__file__).resolve().parent.parent

# Carpeta de las piezas .qb y carpeta de salida. Se dejan aparte de ROOT para
# que quien use este modulo pueda apuntarlas donde quiera. Antes se daban por
# hechas en ROOT/assets, y registro.py tenia que copiar las cincuenta y tres
# piezas a un segundo sitio: once megas duplicados en el repositorio porque en
# Windows no se pudo crear el enlace simbolico.
QB = None
SALIDA = None


def dir_qb() -> Path:
    return QB if QB else ROOT / "assets" / "qb"


def dir_salida() -> Path:
    return SALIDA if SALIDA else ROOT / "assets" / "models"


def hx(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


# --- paletas REALES de Stonehearth (material_maps) ---
HAIR = {  # hilight, midtone, shadows
    "black":    ["#2F2C27", "#211F1C", "#0D0D0D"],
    "blonde":   ["#ECD269", "#C8B35B", "#B99C4D"],
    "brown":    ["#55472F", "#362F23", "#28231A"],
    "platinum": ["#F4F1D7", "#C9BFA7", "#BBAF8E"],
    "red":      ["#CB6928", "#A45023", "#8B3C1C"],
    "sandy":    ["#B4934C", "#8B693C", "#6F512A"],
}
SKIN = {  # hilight, midtone, shadows, blush
    "white":  ["#FFE7B8", "#F2D5A1", "#C6AC7A", "#FFDAB8"],
    "brown1": ["#BDA673", "#B09A68", "#89764A", "#CCAB74"],
    "brown2": ["#5F4D35", "#54432D", "#3C301F", "#634B38"],
}
# placeholders (color_maps) -> orden de material
HAIR_PH = ["#FC6EFE", "#A438A5", "#761B76"]                # hilight, midtone, shadows
SKIN_PH = ["#FFE7B8", "#F2D5A1", "#C6AC7A", "#FFDAB8"]      # hilight, midtone, shadows, blush
EYE_PH  = ["#70FE6E", "#39A538"]                            # hilight, midtone
# El juego no trae material_map de ojos: todos los ciudadanos los llevan
# oscuros. Aqui se abre a varios colores para poder caracterizar a alguien
# concreto. Dos tonos por color, en el mismo orden que los placeholders.
EYES = {
    "marron": ["#5B4A3B", "#241A14"],
    "castano": ["#6B5334", "#2E2113"],
    "azul":   ["#5B7FA5", "#26405C"],
    "gris":   ["#7C838B", "#3A4048"],
    "verde":  ["#5F7A4B", "#2A3D20"],
}
EYE_COL = EYES["marron"]


def escalar(color: str, f: float) -> str:
    """Aclara (f > 1) u oscurece (f < 1) un color, sin salirse de rango."""
    r, g, b = hx(color)
    return "#%02X%02X%02X" % tuple(max(0, min(255, round(c * f))) for c in (r, g, b))


def rampa(base: str, cuantos: int) -> list[str]:
    """Los tonos que necesita un material a partir de un solo color.

    Las paletas del juego traen brillo, medio y sombra —y la piel, además,
    rubor—. El editor deja elegir UN color por elemento, que es como se piensa
    en un color; de ahí se sacan los demás por luminosidad. Los factores salen
    de medir las paletas reales: el brillo esta un 35 % por encima del medio y
    la sombra un 25 % por debajo."""
    factores = [1.35, 1.0, 0.75, 1.3][:cuantos]
    return [escalar(base, f) for f in factores]


def paleta(valor, tabla: dict, cuantos: int, por_defecto: list) -> list[str]:
    """Un nombre de la paleta del juego, o un color suelto en hexadecimal."""
    if isinstance(valor, (list, tuple)):
        return list(valor)
    if isinstance(valor, str) and valor.startswith("#"):
        return rampa(valor, cuantos)
    return tabla.get(valor, por_defecto)


def remap_for(skin, hair, eyes="marron") -> dict[tuple[int, int, int], tuple[int, int, int]]:
    """Cada material del .qb a su color final.

    Los tres argumentos aceptan tanto un nombre de las paletas del juego
    —"white", "brown", "azul"— como un color en hexadecimal, que es lo que
    manda el editor visual cuando se toca un selector."""
    m: dict[tuple, tuple] = {}
    for ph, col in zip(SKIN_PH, paleta(skin, SKIN, 4, SKIN["white"])):
        m[hx(ph)] = hx(col)
    for ph, col in zip(HAIR_PH, paleta(hair, HAIR, 3, HAIR["brown"])):
        m[hx(ph)] = hx(col)
    for ph, col in zip(EYE_PH, paleta(eyes, EYES, 2, EYE_COL)):
        m[hx(ph)] = hx(col)
    return m


# Agrupacion de huesos: mano y dedos se mueven RIGIDOS con el brazo, y los
# dedos del pie con el pie.  (Evita el "25 dedos": no se animan por separado.)
BONE_GROUP = {}
for side in ("left", "right"):
    # Manos y falanges NO se funden con el brazo: tienen pivote y curva propia
    # en las animaciones, y fundirlas dejaba las manos rigidas como un guante.
    BONE_GROUP[side + "Toe"] = side + "Foot"

# Huesos que traen algunas piezas y que la animacion no conoce: no estan en
# anims.pivots, asi que el motor los deja quietos y el gorro queda flotando
# sobre un cuerpo que se mueve. Se cuelgan del hueso real mas cercano.
BONE_GROUP["hat"] = "head"
BONE_GROUP["hair"] = "head"
BONE_GROUP["beard"] = "head"


def compose(parts: list, skin: str, hair: str, name: str, eyes: str = "marron") -> dict:
    # (x,y,z) -> (r,g,b,bone).  El cuerpo lleva su hueso (matriz); cabeza,
    # ojos, cejas y pelo se atan al hueso 'head'.
    voxel: dict[tuple[int, int, int], tuple[int, int, int, str]] = {}
    for pieza in parts:
        # Una pieza puede venir sola o con un desplazamiento. Un número la
        # sube o la baja —("hair_x.qb", 2) la sube dos vóxeles—; una terna
        # (dx, dy, dz) la mueve también de lado y en profundidad.
        #
        # El caso corriente es el pelo del lado femenino del paquete, tallado
        # para una cabeza dos vóxeles más baja: puesto tal cual sobre la
        # masculina deja la coronilla al aire y el personaje sale con melena y
        # calvo a la vez. Alguna pieza suelta, además, viene corrida hacia
        # atrás y hay que traerla hacia la cara.
        fn, mov = pieza if isinstance(pieza, tuple) else (pieza, 0)
        dx, dy, dz = mov if isinstance(mov, tuple) else (0, mov, 0)
        is_head = any(k in fn for k in ("head", "eyes", "brow", "hair"))
        if not is_head:  # cuerpo u OUTFIT (cuerpo completo) -> hueso por matriz
            for x, y, z, r, g, b, bname in parse_qb_bones(str(dir_qb() / fn)):
                bone = re.sub(r"_\d+$", "", bname)  # quitar sufijo _N (outfit y cuerpo)
                bone = BONE_GROUP.get(bone, bone)   # mano/dedos -> brazo
                voxel[(x + dx, y + dy, z + dz)] = (r, g, b, bone)
        else:            # cabeza/ojos/cejas/pelo -> hueso 'head'
            for x, y, z, r, g, b in parse_qb(str(dir_qb() / fn))[0]:
                voxel[(x + dx, y + dy, z + dz)] = (r, g, b, "head")

    remap = remap_for(skin, hair, eyes)
    for k, (r, g, b, bone) in list(voxel.items()):
        nr, ng, nb = remap.get((r, g, b), (r, g, b))
        voxel[k] = (nr, ng, nb, bone)

    items = list(voxel.items())
    xs = [k[0] for k, _ in items]; ys = [k[1] for k, _ in items]; zs = [k[2] for k, _ in items]
    mnx, mny, mnz = min(xs), min(ys), min(zs)
    dims = [max(xs) - mnx + 1, max(ys) - mny + 1, max(zs) - mnz + 1]

    palette: list[list[int]] = []; cindex: dict = {}
    bones: list[str] = []; bindex: dict = {}
    voxels: list[list[int]] = []
    for (x, y, z), (r, g, b, bone) in items:
        ck = (r, g, b)
        ci = cindex.get(ck)
        if ci is None:
            ci = len(palette); cindex[ck] = ci; palette.append([r, g, b])
        bi = bindex.get(bone)
        if bi is None:
            bi = len(bones); bindex[bone] = bi; bones.append(bone)
        voxels.append([x - mnx, y - mny, z - mnz, ci, bi])

    model = {"dims": dims, "palette": palette, "bones": bones, "voxels": voxels}
    out = dir_salida() / f"{name}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")
    print(f"{name}: {len(voxels)} vox, {len(bones)} huesos, piel={skin}, pelo={hair}, ojos={eyes}")
    return model


if __name__ == "__main__":
    # outfit real del juego (chaleco acolchado, cuerpo completo) en vez del cuerpo base
    M = ["vest_m.qb", "male_head.qb", "m_eyes.qb", "m_brows.qb"]
    F = ["vest_f.qb", "f_head.qb", "f_eyes.qb"]
    # ciudadanos: piel + peinado + color de pelo variados (paleta real)
    compose(M + ["m_hair1.qb"], "white",  "brown",  "h1")
    compose(M + ["m_hair2.qb"], "white",  "black",  "h2")
    compose(M + ["m_hair1.qb"], "brown1", "black",  "h3")
    compose(F + ["f_hair1.qb"], "white",  "blonde", "h4")
    compose(F + ["f_hair3.qb"], "brown2", "red",    "h5")
    compose(F + ["f_hair1.qb"], "brown1", "sandy",  "h6")

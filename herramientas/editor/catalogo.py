# -*- coding: utf-8 -*-
"""Catálogo de piezas para el editor visual.

    python herramientas/editor/catalogo.py

Escribe dos cosas en herramientas/editor/piezas/:

- `indice.json`, con todas las piezas disponibles agrupadas por tipo —cabello,
  barba, atuendo, cara— y, por cada una, de qué lado del paquete sale, si hay
  que subirla, cuánto color propio trae y cómo de bien le ajusta al cráneo.
- una miniatura PNG por pieza, que es la proyección de frente del .qb.

La medida de ajuste es la que hizo falta al descubrir que `elf_short` estaba
tallado para una cabeza élfica: se cuenta qué parte de la coronilla y de la nuca
queda tapada. Un corte que encaja pasa del 85 % en las dos; por debajo del 50 %
deja hueco y se ve.
"""

from __future__ import annotations

import json
import sys
import zlib
import struct
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
VOXEL = RAIZ / "herramientas" / "voxel"
sys.path.insert(0, str(VOXEL))

import build_model as B
from qb_parser import parse_qb

PACK = AQUI.parent / "voxel" / "cy_hairstyles" / "entities" / "humans"
QB = VOXEL / "qb"
SALIDA = AQUI / "piezas"
LADO = 44          # miniatura, en píxeles
ESCALA = 2

BARBA = ("beard", "chops", "moustache")


def png(pixeles: list[list[tuple[int, int, int, int]]], destino: Path) -> None:
    """Un PNG mínimo, sin dependencias: el proyecto no tiene ninguna."""
    alto, ancho = len(pixeles), len(pixeles[0])
    crudo = b"".join(
        b"\x00" + b"".join(bytes(px) for px in fila) for fila in pixeles
    )
    def trozo(tipo: bytes, datos: bytes) -> bytes:
        return (struct.pack(">I", len(datos)) + tipo + datos
                + struct.pack(">I", zlib.crc32(tipo + datos) & 0xFFFFFFFF))
    destino.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 6, 0, 0, 0))
        + trozo(b"IDAT", zlib.compress(crudo, 9))
        + trozo(b"IEND", b"")
    )


def miniatura(ruta: Path, destino: Path) -> None:
    """Vista de frente: por cada columna gana el vóxel más adelantado.

    Los colores de marcador se sustituyen por grises: lo que interesa aquí es
    la silueta, no el color, que lo pone después el personaje.
    """
    grises = dict(zip((B.hx(c) for c in B.HAIR_PH),
                      [(190, 185, 178), (140, 134, 126), (92, 87, 81)]))
    frente: dict[tuple[int, int], tuple[int, tuple[int, int, int]]] = {}
    for x, y, z, r, g, b in parse_qb(str(ruta))[0]:
        if (x, y) not in frente or z > frente[(x, y)][0]:
            frente[(x, y)] = (z, (r, g, b))
    if not frente:
        return
    xs = [k[0] for k in frente]; ys = [k[1] for k in frente]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    # Se centra en un cuadro fijo para que todas se comparen a la misma escala.
    filas = []
    for j in range(LADO // ESCALA):
        fila = []
        for i in range(LADO // ESCALA):
            x = x0 + i - ((LADO // ESCALA) - (x1 - x0 + 1)) // 2
            y = y1 - j + ((LADO // ESCALA) - (y1 - y0 + 1)) // 2
            v = frente.get((x, y))
            if v is None:
                fila.append((0, 0, 0, 0))
            else:
                c = grises.get(v[1], v[1])
                fila.append((c[0], c[1], c[2], 255))
        filas.append([p for p in fila for _ in range(ESCALA)])
    png([f for f in filas for _ in range(ESCALA)], destino)


def ajuste(vox, dy: int) -> tuple[int, int]:
    """Cuánto tapa de la coronilla y de la nuca, en tanto por ciento."""
    cab = parse_qb(str(QB / "m_head.qb"))[0]
    alto, fondo = {}, {}
    for x, y, z, *_ in cab:
        if (x, z) not in alto or y > alto[(x, z)]:
            alto[(x, z)] = y
        if (x, y) not in fondo or z > fondo[(x, y)]:
            fondo[(x, y)] = z
    nuca = [k for k in fondo if k[1] >= 22]
    hay = {(x, y + dy, z) for x, y, z, *_ in vox}
    cor = sum(1 for (x, z), y in alto.items()
              if (x, y + 1, z) in hay or (x, y, z) in hay) * 100 // len(alto)
    nu = sum(1 for (x, y) in nuca
             if (x, y, fondo[(x, y)] + 1) in hay or (x, y, fondo[(x, y)]) in hay) * 100 // len(nuca)
    return cor, nu


def piezas() -> dict:
    marc = {B.hx(c) for c in B.HAIR_PH}
    SALIDA.mkdir(parents=True, exist_ok=True)
    catalogo = {"cabello": [], "barba": [], "atuendo": [], "cara": []}
    vistas: dict[str, Path] = {}

    # Primero el juego, después el paquete: si un nombre está en los dos manda
    # el masculino del paquete, que es el tallado para esta cabeza.
    fuentes = [(QB, "juego", 0)]
    if PACK.exists():
        fuentes += [(PACK / "female", "female", 2), (PACK / "male", "male", 0)]

    for carpeta, origen, alza in fuentes:
        if not carpeta.exists():
            continue
        for p in sorted(carpeta.glob("*.qb")):
            n = p.stem
            if n.startswith("o_"):
                tipo = "atuendo"
            elif n.endswith("_head") or "_head_" in n or n.endswith("_head_bald"):
                tipo = "cara"
            elif any(k in n for k in BARBA):
                tipo = "barba"
            elif "hair" in n or "style" in n or n.startswith(("elf_", "kemu_", "kemo_", "hen_", "cintrian_")):
                tipo = "cabello"
            else:
                continue
            vistas[n] = p
            catalogo.setdefault(tipo, [])
            catalogo[tipo] = [x for x in catalogo[tipo] if x["nombre"] != n]
            vox = parse_qb(str(p))[0]
            if not vox:
                continue
            propio = sum(1 for v in vox if (v[3], v[4], v[5]) not in marc) / len(vox)
            dato = {
                "nombre": n,
                "tipo": tipo,
                "origen": origen,
                "alza": alza if origen == "female" or n.startswith("f_hair") else 0,
                "propio": round(propio, 3),
                "vox": len(vox),
            }
            if tipo == "cabello":
                cor, nu = ajuste(vox, dato["alza"])
                dato["corona"], dato["nuca"] = cor, nu
            catalogo[tipo].append(dato)

    for n, ruta in vistas.items():
        miniatura(ruta, SALIDA / f"{n}.png")

    for k in catalogo:
        catalogo[k].sort(key=lambda d: d["nombre"].lower())
    return catalogo


if __name__ == "__main__":
    cat = piezas()
    cat["paletas"] = {
        "pelo": B.HAIR,
        "piel": B.SKIN,
        "ojos": B.EYES,
    }
    (SALIDA / "indice.json").write_text(
        json.dumps(cat, ensure_ascii=False), encoding="utf-8")
    print(" ".join(f"{k}: {len(v)}" for k, v in cat.items() if isinstance(v, list)))
    print("->", SALIDA / "indice.json")

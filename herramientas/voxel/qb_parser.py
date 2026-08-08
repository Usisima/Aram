"""Parser de modelos Qubicle (.qb) de Stonehearth -> voxeles (x,y,z,r,g,b).

Soporta: sin comprimir, colorFormat 0 (RGBA) y 1 (BGRA), con o sin
mascara de visibilidad.  Combina todas las matrices (partes/huesos) de un
modelo aplicando su offset de posicion, de modo que el cuerpo del
hearthling (28 partes) queda ensamblado en una sola nube de voxeles.
"""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

_CODEFLAG = 2       # QB RLE: marca una corrida (count + color)
_NEXTSLICE = 6      # QB RLE: fin de la capa z


def _colors(word: int, colorfmt: int) -> tuple[int, int, int, int]:
    c0, c1, c2, c3 = word & 0xFF, (word >> 8) & 0xFF, (word >> 16) & 0xFF, (word >> 24) & 0xFF
    return (c0, c1, c2, c3) if colorfmt == 0 else (c2, c1, c0, c3)  # RGBA / BGRA


def _read_matrix(data: bytes, off: int, colorfmt: int, compressed: int):
    """Lee una matriz .qb (comprimida RLE o no). Devuelve (voxels, nuevo_off, name).
    voxels = lista de (gx,gy,gz,r,g,b) ya con offset de posicion aplicado."""
    namelen = data[off]; off += 1
    name = data[off:off + namelen].decode("latin1"); off += namelen
    sx, sy, sz = struct.unpack_from("<III", data, off); off += 12
    px, py, pz = struct.unpack_from("<iii", data, off); off += 12
    out = []

    def emit(word, idx):
        r, g, b, a = _colors(word, colorfmt)
        if a != 0:                       # presente (o con mascara: alguna cara visible)
            x = idx % sx; y = idx // sx
            out.append((px + x, py + y, pz + z, r, g, b))

    if not compressed:
        for z in range(sz):
            for i in range(sx * sy):
                (word,) = struct.unpack_from("<I", data, off); off += 4
                emit(word, i)
    else:                                 # RLE (MagicaVoxel/Qubicle comprimido)
        for z in range(sz):
            idx = 0
            while True:
                (word,) = struct.unpack_from("<I", data, off); off += 4
                if word == _NEXTSLICE:
                    break
                if word == _CODEFLAG:
                    (count,) = struct.unpack_from("<I", data, off); off += 4
                    (word,) = struct.unpack_from("<I", data, off); off += 4
                    for _ in range(count):
                        emit(word, idx); idx += 1
                else:
                    emit(word, idx); idx += 1
    return out, off, name


def parse_qb(path: str) -> tuple[list[tuple[int, int, int, int, int, int]], dict]:
    data = Path(path).read_bytes()
    off = 0
    (ver,) = struct.unpack_from("<I", data, off); off += 4
    colorfmt, zaxis, compressed, vismask, nmat = struct.unpack_from("<IIIII", data, off)
    off += 20

    voxels: list[tuple[int, int, int, int, int, int]] = []
    for _ in range(nmat):
        mv, off, _name = _read_matrix(data, off, colorfmt, compressed)
        voxels.extend(mv)

    meta = {"ver": ver, "colorfmt": colorfmt, "zaxis": zaxis,
            "compressed": compressed, "vismask": vismask, "matrices": nmat}
    return voxels, meta


def parse_qb_bones(path: str) -> list[tuple[int, int, int, int, int, int, str]]:
    """Como parse_qb pero conserva el NOMBRE DEL HUESO (matriz) de cada voxel."""
    data = Path(path).read_bytes()
    off = 0
    struct.unpack_from("<I", data, off); off += 4
    colorfmt, zaxis, compressed, vismask, nmat = struct.unpack_from("<IIIII", data, off)
    off += 20
    out: list[tuple] = []
    for _ in range(nmat):
        mv, off, name = _read_matrix(data, off, colorfmt, compressed)
        for (x, y, z, r, g, b) in mv:
            out.append((x, y, z, r, g, b, name))
    return out


def bbox(voxels):
    xs = [v[0] for v in voxels]; ys = [v[1] for v in voxels]; zs = [v[2] for v in voxels]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


if __name__ == "__main__":
    for path in sys.argv[1:]:
        vox, meta = parse_qb(path)
        name = Path(path).name
        if not vox:
            print(f"{name}: 0 voxeles  meta={meta}")
            continue
        lo, hi = bbox(vox)
        dims = (hi[0] - lo[0] + 1, hi[1] - lo[1] + 1, hi[2] - lo[2] + 1)
        print(f"{name}: {len(vox)} voxeles  bbox={lo}..{hi}  dims={dims}  meta={meta}")

"""Hoja de contactos de las piezas de pelo y barba.

    python herramientas/voxel/hoja_piezas.py male hair_kitty_loki hair_braid ...

Proyecta cada .qb de frente —para cada columna se pinta el voxel mas adelantado—
y escribe un PPM por pieza en una carpeta temporal. Es una vista plana y tosca,
pero basta para elegir peinado sin montar el motor 3D: hornear veinte modelos
en el navegador para mirarlos son veinte minutos, y esto son dos segundos.

Los colores de marcador (magenta) se sustituyen por un gris medio para que la
forma se lea; lo que importa aqui es la silueta, no el color.
"""

from __future__ import annotations

import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))

import build_model as B
from qb_parser import parse_qb

NUEVAS = AQUI / "cy_hairstyles" / "entities" / "humans"
SALIDA = Path(sys.argv[0]).parent / "_hoja"
ESCALA = 6

# La cabeza ocupa aproximadamente esta caja; se fija para que todas las piezas
# se dibujen a la misma escala y en el mismo sitio.
X0, X1 = 4, 26
Y0, Y1 = 15, 34


def proyectar(ruta: Path) -> list[list[tuple[int, int, int]]]:
    """Vista frontal: por cada (x, y) gana el voxel de mayor z."""
    frente: dict[tuple[int, int], tuple[int, tuple[int, int, int]]] = {}
    for x, y, z, r, g, b in parse_qb(str(ruta))[0]:
        clave = (x, y)
        if clave not in frente or z > frente[clave][0]:
            frente[clave] = (z, (r, g, b))

    fondo = (227, 224, 205)
    grises = {
        B.hx(B.HAIR_PH[0]): (150, 140, 130),
        B.hx(B.HAIR_PH[1]): (105, 96, 88),
        B.hx(B.HAIR_PH[2]): (70, 63, 57),
    }

    filas = []
    for y in range(Y1, Y0 - 1, -1):
        fila = []
        for x in range(X0, X1 + 1):
            v = frente.get((x, y))
            fila.append(fondo if v is None else grises.get(v[1], v[1]))
        filas.append(fila)
    return filas


def escribir_ppm(filas, destino: Path) -> None:
    alto, ancho = len(filas), len(filas[0])
    with destino.open("w", encoding="ascii") as f:
        f.write(f"P3\n{ancho * ESCALA} {alto * ESCALA}\n255\n")
        for fila in filas:
            linea = " ".join(f"{r} {g} {b}" for px in fila for r, g, b in [px] * ESCALA)
            for _ in range(ESCALA):
                f.write(linea + "\n")


if __name__ == "__main__":
    sexo = sys.argv[1]
    piezas = sys.argv[2:]
    SALIDA.mkdir(exist_ok=True)

    for nombre in piezas:
        ruta = NUEVAS / sexo / f"{nombre}.qb"
        if not ruta.exists():
            ruta = B.dir_qb() / f"{nombre}.qb"
        if not ruta.exists():
            print(f"{nombre}: no esta")
            continue
        escribir_ppm(proyectar(ruta), SALIDA / f"{nombre}.ppm")
        print(nombre)

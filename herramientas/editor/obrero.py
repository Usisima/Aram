# -*- coding: utf-8 -*-
"""El que compone modelos para el editor, sin morirse entre uno y otro.

    python herramientas/editor/obrero.py

Lee peticiones por la entrada estándar, una por línea en JSON, y contesta por la
salida, también una línea de JSON por respuesta.

    {"orden": "componer", "personaje": {...}, "nombre": "previa"}
    {"orden": "adios"}

Existe por una razón medida: arrancar Python e importar build_model en cada
toque del editor costaba 29 segundos por pieza, y eso no es editar en vivo. Con
el proceso levantado y las piezas ya leídas en memoria, una composición baja a
décimas: lo caro no era componer, era arrancar y volver a leer los mismos .qb
—cuerpo, atuendo, cara— una y otra vez.
"""

from __future__ import annotations

import contextlib
import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
VOXEL = AQUI.parent / "voxel"
sys.path.insert(0, str(VOXEL))

import build_model
import registro
from qb_parser import parse_qb, parse_qb_bones

build_model.QB = VOXEL / "qb"
build_model.SALIDA = VOXEL / "modelos"

# Las piezas leídas, ya en memoria. Un personaje son seis capas y entre dos
# ediciones cambia una: las otras cinco no hay por qué volver a leerlas.
CACHE: dict[str, list] = {}

_parse_qb = parse_qb
_parse_qb_bones = parse_qb_bones


def qb_cacheado(ruta: str):
    clave = "v:" + str(ruta)
    if clave not in CACHE:
        CACHE[clave] = _parse_qb(str(ruta))
    return CACHE[clave]


def qb_bones_cacheado(ruta: str):
    clave = "b:" + str(ruta)
    if clave not in CACHE:
        CACHE[clave] = _parse_qb_bones(str(ruta))
    return CACHE[clave]


# build_model llama a estas dos por su nombre de módulo, así que se sustituyen
# ahí: es la forma de cachear sin tocar el código que usa el sitio.
build_model.parse_qb = qb_cacheado
build_model.parse_qb_bones = qb_bones_cacheado


def componer(peticion: dict) -> dict:
    p = peticion["personaje"]
    nombre = peticion.get("nombre") or "_previa"
    capas = registro.piezas(
        p["sexo"], p["oficio"], p["cara"], p.get("pelo"), p.get("barba"), p.get("ajuste")
    )
    # `compose` escribe por pantalla lo que ha compuesto —viene de cuando se
    # llamaba a mano desde la consola— y aquí la salida es el canal por el que
    # van las respuestas: esa línea suelta descolocaba todas las siguientes y el
    # visor no llegaba a recibir nunca un modelo. Se desvía a stderr, donde
    # sigue viéndose en la consola del servidor.
    with contextlib.redirect_stdout(sys.stderr):
        modelo = build_model.compose(
            capas, p["piel"], p["color"], nombre, p.get("ojos", "marron")
        )
    return {"modelo": modelo}


def main() -> None:
    # Sin buffer: el servidor lee línea a línea y no puede esperar a que se
    # llene un búfer de cuatro kilobytes.
    for linea in sys.stdin:
        linea = linea.strip()
        if not linea:
            continue
        try:
            peticion = json.loads(linea)
            orden = peticion.get("orden")
            if orden == "adios":
                return
            if orden == "componer":
                respuesta = componer(peticion)
            elif orden == "hola":
                respuesta = {"listo": True, "piezas": len(CACHE)}
            else:
                respuesta = {"error": f"no entiendo la orden {orden!r}"}
        except Exception as e:  # una petición mala no puede tumbar al obrero
            respuesta = {"error": f"{type(e).__name__}: {e}"}
        sys.stdout.write(json.dumps(respuesta) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()

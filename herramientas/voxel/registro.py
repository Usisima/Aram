"""Registro de piezas y generador de modelos voxel variados.

    python herramientas/voxel/registro.py

Compone personajes a partir de las piezas de Stonehearth que hay en qb/ y
escribe un JSON con esqueleto por cada uno en modelos/.

Reutiliza `compose` de build_model.py, que viene del proyecto Math y ya aplica
el remapeo de color real del juego: los .qb traen colores de marcador (magenta
para el pelo, verde para los ojos) que el juego sustituye por la paleta de cada
ciudadano. Aquí solo se amplía el catálogo y se generan las combinaciones.

Las piezas se acumulan por capas sobre el mismo esqueleto de nueve huesos, que
es lo que permite que cualquier combinación funcione con las 42 animaciones sin
tocar nada más.
"""

from __future__ import annotations

import itertools
import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))

import build_model
from build_model import HAIR, SKIN, compose

# Las piezas están en qb/ al lado de este archivo, y los modelos salen a
# modelos/. Se le dice a build_model dónde mirar en vez de montarle la
# estructura que esperaba: antes se copiaban ahí las cincuenta y tres piezas
# —once megas— porque en Windows no se pudo crear el enlace simbólico.
build_model.QB = AQUI / "qb"
build_model.SALIDA = AQUI / "modelos"

# ── Catálogo ──
# Cada entrada es el nombre del .qb sin extensión. `None` significa "sin esa
# pieza", que es una variante más: hay quien no lleva barba ni gorro.

CARAS_M = ["m_head", "m_head_1", "m_head_2", "m_head_3", "m_head_4", "m_head_5"]
PELOS_M = ["m_hair_1", "m_hair_2", "m_hair_3", "m_hair_4", "m_hair_old_1", "m_hair_old_2", None]
BARBAS_M = ["m_beard", "m_beard_epic", "m_chin_beard", "m_chops", None, None]

CARAS_F = ["f_head"]
PELOS_F = ["f_hair_1", "f_hair_2", "f_hair_3", "f_hair_4",
           "f_hair_5", "f_hair_6", "f_hair_7", "f_hair_8"]

# Atuendos que traen gorro —su .qb tiene hueso 'hat'—. Tapan la cabeza entera:
# el peinado deja de verse y lo que se distingue de un personaje a otro es el
# sombrero, no él. No se usan.
CON_GORRO = {"cook", "geomancer", "herbalist", "weaver"}

OFICIOS = ["architect", "carpenter", "cleric", "engineer", "mason", "potter"]

PIELES = list(SKIN)   # white, brown1, brown2
COLORES_PELO = list(HAIR)  # black, blonde, brown, platinum, red, sandy


# Peinados tomados del lado FEMENINO del paquete, que es donde está el pelo
# largo. Están tallados para la cabeza femenina, que es dos vóxeles más baja que
# la masculina: sobre un hombre hay que subirlos esos dos o la melena cae bien
# por los lados y por detrás y la coronilla se queda pelada.
SUBIR_FEMENINO = 2

# Piezas que no encajan por su cuenta y hay que mover. La terna es (dx, dy, dz):
# de lado, en alto y en profundidad. De momento no hace falta ninguna: cuando
# una pieza no encaja suele ser que esta tallada para otro craneo, y moverla
# arregla un lado y estropea el otro. Se comprueba midiendo cuanto tapa de la
# corona y de la nuca; un corte que ajusta pasa del 85 % en las dos.
AJUSTE_PIEZA = {}

PELOS_LARGOS_F = {
    "hair_kitty_boycut",
    "hair_kitty_rogue",
    "kittystyle_lowbun",
    "kittystyle_straycurls",
    "hair_kitty_long",
    "hair_kitty_longersimplecurls",
    "hair_kitty_longerfrizzcurls",
    "hair_kitty_omgsimplecurls",
    "frosted_hair_kitty_eastlong",
    "hair_kitty_workout",
    "hair_kitty_fringed",
}


def piezas(sexo: str, oficio: str, cara: str, pelo, barba=None, ajustes=None) -> list:
    """Capas de un personaje, de dentro hacia fuera.

    El cuerpo va primero y el atuendo encima, como en el juego. Poniendo solo
    el atuendo el personaje se quedaba SIN MANOS: los .qb de oficio traen diez
    huesos y ninguno de dedos, mientras que el cuerpo trae veintiocho, dieciocho
    de ellos de falanges. Las manos asoman por las mangas."""
    # Lo que el taller haya movido a mano: una terna (dx, dy, dz) por ranura.
    # Se suma a lo que ya lleve la pieza por sí misma.
    a = ajustes or {}

    def con(archivo, ranura, base=(0, 0, 0)):
        m = a.get(ranura) or (0, 0, 0)
        mov = (base[0] + m[0], base[1] + m[1], base[2] + m[2])
        return (archivo, mov) if any(mov) else archivo

    partes = [
        f"{sexo}_body.qb",
        con(f"o_{oficio}_{sexo}.qb", "atuendo"),
        con(f"{cara}.qb", "cara"),
        f"{sexo}_eyes.qb",
    ]
    if sexo == "m":
        partes.append("m_brows.qb")
        if barba:
            partes.append(con(f"{barba}.qb", "barba"))
    if pelo:
        alza = SUBIR_FEMENINO if (sexo == "m" and pelo in PELOS_LARGOS_F) else 0
        px, py, pz = AJUSTE_PIEZA.get(pelo, (0, 0, 0))
        partes.append(con(f"{pelo}.qb", "cabello", (px, py + alza, pz)))
    return partes


# ── Matemáticos ──
# Cada uno con el aspecto que se le conoce por sus retratos: peinado, barba,
# color de pelo y atuendo. Es una caracterización, no un parecido: con piezas
# de veinte vóxeles no hay retrato posible, se busca que se distingan.
#
# Los peinados y las barbas salen del paquete cy_hairstyles/ que hay junto a
# del proyecto: 65 piezas masculinas y 86 femeninas, muchas más y mejores que
# las siete del juego base.
#
# Las MELENAS Y PELUCAS salen todas del lado femenino del paquete, que es donde
# está el pelo largo: en el XVII y el XVIII los hombres de estos retratos
# llevaban peluca de bucles o media melena, y en las piezas masculinas no hay
# nada que pase de la nuca. La pieza no sabe de quién es —mismo esqueleto,
# mismos marcadores de color—, así que se elige por la forma y ya está. Encajan sin tocar nada —mismo espacio de
# coordenadas, mismos marcadores de color, mismos huesos 'head' y 'hat'—, y se
# eligieron mirándolas con hoja_piezas.py, que las proyecta de frente sin tener
# que hornear un modelo por cada una.
#
# DOS TRAMPAS de las piezas, las dos descubiertas a base de mirar el resultado:
#
# 1. Solo m_head, m_head_bald y f_head son caras limpias. Las numeradas
#    —m_head_1 a m_head_5— vienen con su propio peinado YA PINTADO, entre 500 y
#    1600 vóxeles de color fijo que no pasan por el remapeo. A Cantor le salía
#    el pelo rubio y la barba negra por eso: la barba sí obedecía y el pelo era
#    de la cara.
# 2. Los atuendos cook, weaver, geomancer y herbalist traen gorro —hueso 'hat'—
#    y tapan el peinado. Solo se usan donde el gorro viene bien.
#
# Aviso sobre los OJOS: el color de ojos de estas personas no está documentado
# en ninguna parte. Lo de aquí es elección, no dato.
#
# De Euclides y Arquímedes no existe ningún retrato del natural: lo que se
# repite —viejos, barbudos, con túnica— viene de la imaginación de escultores
# muy posteriores. Se sigue esa convención, que es lo único que hay.

# Los personajes viven en personajes.json, al lado de este archivo: el editor
# visual (herramientas/editor) los escribe desde ahí y aquí solo se leen. Lo que
# antes era este diccionario está volcado tal cual en ese JSON, con los mismos
# campos y los mismos comentarios pasados a la clave `nota`.
def cargar_personajes() -> dict:
    ruta = AQUI / "personajes.json"
    if not ruta.exists():
        return {}
    return json.loads(ruta.read_text(encoding="utf-8"))


PERSONAJES = cargar_personajes()


def generar_personajes() -> list[str]:
    """Un modelo por matemático, con su nombre, en modelos/."""
    import json

    salida = AQUI / "modelos"
    salida.mkdir(exist_ok=True)
    hechos = []

    for nombre, p in PERSONAJES.items():
        if p["oficio"] in CON_GORRO:
            print(f"  {nombre}: {p['oficio']} lleva gorro y taparia la cabeza")
            continue
        partes = piezas(
            p["sexo"], p["oficio"], p["cara"], p["pelo"], p["barba"], p.get("ajuste")
        )
        try:
            modelo = compose(partes, p["piel"], p["color"], nombre, p["ojos"])
        except Exception as e:
            print(f"  {nombre}: FALLA {type(e).__name__}: {e}")
            continue
        (salida / f"{nombre}.json").write_text(json.dumps(modelo), encoding="utf-8")
        hechos.append(nombre)

    return hechos


def generar(cuantos: int = 24) -> list[str]:
    """Recorre el producto de las variantes en vueltas desfasadas.

    No es aleatorio a propósito: con índices desfasados por distintos primos,
    dos modelos seguidos nunca comparten cara, pelo y oficio, y el resultado es
    el mismo en cada ejecución — un modelo que cambia de aspecto entre dos
    compilaciones sería un incordio."""
    salida = AQUI / "modelos"
    salida.mkdir(exist_ok=True)
    hechos = []

    for i in range(cuantos):
        hombre = i % 2 == 0
        sexo = "m" if hombre else "f"
        caras = CARAS_M if hombre else CARAS_F
        pelos = PELOS_M if hombre else PELOS_F

        combo = dict(
            oficio=OFICIOS[(i * 3) % len(OFICIOS)],
            cara=caras[(i * 5) % len(caras)],
            pelo=pelos[(i * 7) % len(pelos)],
            barba=BARBAS_M[(i * 11) % len(BARBAS_M)] if hombre else None,
        )
        piel = PIELES[(i * 13) % len(PIELES)]
        color = COLORES_PELO[(i * 17) % len(COLORES_PELO)]

        nombre = f"v{i:02d}"
        try:
            modelo = compose(piezas(sexo, **combo), piel, color, nombre)
        except Exception as e:  # una pieza que falte no debe tumbar el lote
            print(f"  {nombre}: FALLA {type(e).__name__}: {e}")
            continue

        import json

        (salida / f"{nombre}.json").write_text(json.dumps(modelo), encoding="utf-8")
        hechos.append(nombre)

    return hechos


if __name__ == "__main__":
    #   python registro.py personajes   -> uno por matemático, con su nombre
    #   python registro.py [n]          -> n ciudadanos variados, v00, v01…
    if len(sys.argv) > 1 and sys.argv[1] == "personajes":
        hechos = generar_personajes()
    else:
        hechos = generar(int(sys.argv[1]) if len(sys.argv) > 1 else 24)
    print(f"\n{len(hechos)} modelos en {AQUI / 'modelos'}")

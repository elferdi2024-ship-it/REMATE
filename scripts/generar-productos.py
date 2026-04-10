#!/usr/bin/env python3
"""
generar-productos.py

Maps the Excel price list to productos.json following PRD v3 section-16 spec.

Excel columns (first 7):
  0 = codigo
  1 = producto app   (skipped)
  2 = nombre
  3 = costo          (skipped)
  4 = '$' separator  (skipped)
  5 = precio consumidor
  6 = '$' separator  (skipped)

Row 1 is the header row and is skipped.
"""

import json
import sys
from collections import Counter
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("Error: openpyxl is required. Install with: pip install openpyxl", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent
XLSX_PATH = BASE_DIR / "lista de precio - nombre comercial -6-4-2026.xlsx"
OUTPUT_PATH = BASE_DIR / "distribuidora" / "public" / "productos.json"

# ---------------------------------------------------------------------------
# Category keyword map
# ---------------------------------------------------------------------------
KEYWORDS = {
    "Aceites y Aderezos": ["aceite", "aceituna", "aderezo", "mayonesa", "ketchup", "mostaza", "barbacoa", "vinagre", "salsa"],
    "Bebidas": ["agua", "jugo", "gaseosa", "cerveza", "vino", "refresco", "bebida", "sidra", "fernet", "whisky", "sprite", "pepsi", "coca"],
    "Caf\xe9, T\xe9 y Yerba": ["cafe", "te ", "yerba", "bracafe", "nescafe"],
    "Cereales y Granola": ["avena", "copos", "granola", "cereal"],
    "Congelados": ["cong", "mccain", "boreal", "nugget", "espinaca", "brocoli"],
    "Conservas de Pescado": ["atun", "sardina", "lomito", "pescado", "grated"],
    "Descartables y Embalaje": ["descart", "tenedor", "cuchara", "vaso plast", "bandeja", "caja", "bolsa"],
    "Especias y Condimentos": ["sal ", "azucar", "oregano", "pimenton", "adobo", "ajo", "caldo", "condimento", "harina "],
    "Fiambres y Carnes": ["jamon", "mortadela", "salchicha", "pancho", "chorizo", "bondiola", "morcilla", "fiambre", "carne", "arrollado"],
    "Golosinas y Dulces": ["alfajor", "caramelo", "chocolate", "gomita", "chicle", "dulce de membrillo", "galleta rellena", "fini", "barrita"],
    "Harinas, Pastas y Legumbres": ["harina", "faina", "fideo", "arroz", "lenteja", "garbanzo", "almidon", "pasta", "polenta"],
    "L\xe1cteos": ["leche", "queso", "yogur", "crema de leche", "manteca", "ricota", "dulce de leche", "muzzarel", "conaprole"],
    "Limpieza": ["jabon en polvo", "jabon liquido", "lavandina", "desinfectante", "limpiador", "detergente", "amoniaco"],
    "Mermeladas y Conservas Dulces": ["mermelada", "anana en alm", "membrillo", "miel", "dulce de fruta", "conserva"],
    "Panader\xeda": ["pan de molde", "pan catalan", "pan de viena", "pan rallado", "tostada"],
    "Papel e Higiene": ["papel higien", "servilleta", "toalla de cocina", "rollo"],
    "Higiene Personal": ["jabon de manos", "afeitar", "desodorante", "shampoo", "pa\xf1al", "toallita"],
}


def categorizar(nombre: str) -> str:
    """Return the best-matching category for *nombre*, or 'Otros'."""
    lower = nombre.lower()
    for categoria, palabras in KEYWORDS.items():
        for palabra in palabras:
            if palabra in lower:
                return categoria
    return "Otros"


def main() -> None:
    if not XLSX_PATH.exists():
        print(f"Error: Excel file not found: {XLSX_PATH}", file=sys.stderr)
        sys.exit(1)

    try:
        wb = openpyxl.load_workbook(XLSX_PATH, data_only=True, read_only=True)
    except Exception as exc:
        print(f"Error opening Excel file: {exc}", file=sys.stderr)
        sys.exit(1)

    ws = wb.active
    if ws is None:
        print("Error: No active worksheet found.", file=sys.stderr)
        sys.exit(1)

    productos = []
    row_iter = ws.iter_rows(min_row=2, max_col=7, values_only=True)

    for row in row_iter:
        codigo_raw = row[0]
        nombre_raw = row[2]
        precio_raw = row[5]

        # Skip rows where nombre or precio is missing
        if nombre_raw is None or precio_raw is None:
            continue
        if str(nombre_raw).strip() == "":
            continue
        try:
            precio = float(precio_raw)
        except (ValueError, TypeError):
            continue

        nombre = str(nombre_raw).strip().upper()
        # Clean up leading/trailing whitespace that may persist after upper()
        codigo = str(codigo_raw).strip() if codigo_raw is not None else ""

        productos.append({
            "codigo": codigo,
            "nombre": nombre,
            "precio": precio,
            "categoria": categorizar(nombre),
        })

    wb.close()

    # ------------------------------------------------------------------
    # Write compact JSON
    # ------------------------------------------------------------------
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(productos, f, ensure_ascii=False, separators=(",", ":"))
    except OSError as exc:
        print(f"Error writing output file: {exc}", file=sys.stderr)
        sys.exit(1)

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    cat_counts = Counter(p["categoria"] for p in productos)
    print(f"Total products: {len(productos)}")
    print(f"Output: {OUTPUT_PATH}")
    print("Breakdown by category:")
    for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()

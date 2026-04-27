import pandas as pd
import json
import os

# 1. Definir categorías válidas según src/types/index.ts
CATEGORIAS_VALIDAS = [
    "ACEITES Y GRASAS",
    "ARTÍCULOS DEL HOGAR",
    "BEBIDAS ALCOHÓLICAS",
    "BEBIDAS SIN ALCOHOL",
    "CARNES Y EMBUTIDOS",
    "CONDIMENTOS Y ESPECIAS",
    "CONGELADOS",
    "CONSERVAS Y ENLATADOS",
    "DESCARTABLES Y ART. DEL HOGAR",
    "DULCES Y MERMELADAS",
    "FRUTAS Y VERDURAS",
    "GOLOSINAS Y SNACKS",
    "HARINAS, PASTAS Y CEREALES",
    "HIGIENE PERSONAL",
    "LÁCTEOS Y HUEVOS",
    "LIMPIEZA DEL HOGAR",
    "MASCOTAS",
    "OTROS",
    "PANADERÍA Y REPOSTERÍA",
    "SALSAS Y ADEREZOS",
    "YERBA, TÉ Y CAFÉ"
]

# 2. Mapeo de categorías del Excel a las categorías de la App
MAPEO_EXCEL_A_APP = {
    "Aceites y Aderezos": "ACEITES Y GRASAS",
    "Articulos del hogar": "ARTÍCULOS DEL HOGAR",
    "Artículos del Hogar": "ARTÍCULOS DEL HOGAR",
    "Bebidas": "BEBIDAS SIN ALCOHOL",
    "Bebidas Alcoholicas": "BEBIDAS ALCOHÓLICAS",
    "Bebidas Alcohólicas": "BEBIDAS ALCOHÓLICAS",
    "Carnes": "CARNES Y EMBUTIDOS",
    "Fiambres": "CARNES Y EMBUTIDOS",
    "Fiambres y Carnes": "CARNES Y EMBUTIDOS",
    "Especias y Condimentos": "CONDIMENTOS Y ESPECIAS",
    "Congelados": "CONGELADOS",
    "Conservas": "CONSERVAS Y ENLATADOS",
    "Descartables": "DESCARTABLES Y ART. DEL HOGAR",
    "Descartables y Embalaje": "DESCARTABLES Y ART. DEL HOGAR",
    "DESCARTABLES Y ARTÍCULOS DEL HOGAR": "DESCARTABLES Y ART. DEL HOGAR",
    "Dulces": "GOLOSINAS Y SNACKS",
    "Golosinas y Dulces": "GOLOSINAS Y SNACKS",
    "Harinas": "HARINAS, PASTAS Y CEREALES",
    "Pastas": "HARINAS, PASTAS Y CEREALES",
    "Legumbres": "HARINAS, PASTAS Y CEREALES",
    "Harinas, Pastas y Legumbres": "HARINAS, PASTAS Y CEREALES",
    "Higiene Personal": "HIGIENE PERSONAL",
    "Lácteos": "LÁCTEOS Y HUEVOS",
    "Lacteos": "LÁCTEOS Y HUEVOS",
    "Quesos": "LÁCTEOS Y HUEVOS",
    "Limpieza": "LIMPIEZA DEL HOGAR",
    "Mascotas": "MASCOTAS",
    "Panadería": "PANADERÍA Y REPOSTERÍA",
    "Panadería y Repostería": "PANADERÍA Y REPOSTERÍA",
    "Mermeladas": "DULCES Y MERMELADAS",
    "Yerba": "YERBA, TÉ Y CAFÉ",
    "Té": "YERBA, TÉ Y CAFÉ",
    "Café": "YERBA, TÉ Y CAFÉ",
    "Café, Té y Yerba": "YERBA, TÉ Y CAFÉ",
    "Salsas": "SALSAS Y ADEREZOS",
    "Aderezos": "SALSAS Y ADEREZOS",
}

def normalizar_categoria(cat_excel):
    if not isinstance(cat_excel, str):
        return "OTROS"
    
    # Limpieza básica
    cat_limpia = cat_excel.strip()
    
    # Intento de mapeo directo
    if cat_limpia in MAPEO_EXCEL_A_APP:
        return MAPEO_EXCEL_A_APP[cat_limpia]
    
    # Intento insensible a mayúsculas
    for key, val in MAPEO_EXCEL_A_APP.items():
        if key.lower() == cat_limpia.lower():
            return val
            
    # Si ya es una categoría válida (en mayúsculas por ej)
    if cat_limpia.upper() in CATEGORIAS_VALIDAS:
        return cat_limpia.upper()
        
    return "OTROS"

def run():
    excel_path = r'd:\PROYECTOS\ELREMATE\modificaciones\lista_corregida.xlsx'
    mapping_path = r'd:\PROYECTOS\ELREMATE\distribuidora\src\lib\categoria_mapping.json'
    
    print(f"Leyendo Excel: {excel_path}")
    df = pd.read_excel(excel_path)
    
    # Columnas: ['Cdigo 2', 'producto app', 'Producto programa', 'Costo', ' ', 'CONSUMIDOR', ' .1', 'CATEGORA']
    # Usaremos 'Cdigo 2' como key y 'CATEGORA' como value
    col_codigo = 'Cdigo 2'
    col_categoria = 'CATEGORA'
    
    # Verificar si las columnas existen (por el tema de encoding)
    if col_codigo not in df.columns:
        # Buscar algo similar
        col_codigo = [c for c in df.columns if 'digo' in str(c)][0]
    if col_categoria not in df.columns:
        col_categoria = [c for c in df.columns if 'ATEGOR' in str(c)][0]

    print(f"Usando columnas: {col_codigo} -> {col_categoria}")
    
    mapping = {}
    for _, row in df.iterrows():
        codigo = str(row[col_codigo]).strip()
        if not codigo or codigo == 'nan' or codigo == 'None':
            continue
            
        cat_excel = row[col_categoria]
        cat_app = normalizar_categoria(cat_excel)
        
        # Guardar en el mapping
        mapping[codigo] = cat_app

    # Guardar el nuevo mapping
    with open(mapping_path, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    print(f"Mapping actualizado: {len(mapping)} códigos procesados.")
    
    # Mostrar resumen de categorías resultantes
    from collections import Counter
    summary = Counter(mapping.values())
    print("\nResumen de categorías asignadas:")
    for cat, count in summary.most_common():
        print(f" - {cat}: {count}")

if __name__ == "__main__":
    run()

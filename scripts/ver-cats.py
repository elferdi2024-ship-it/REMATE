import pandas as pd
excel_path = r'd:\PROYECTOS\ELREMATE\modificaciones\lista_corregida.xlsx'
df = pd.read_excel(excel_path)
col_categoria = [c for c in df.columns if 'ATEGOR' in str(c)][0]
categorias = df[col_categoria].unique()
print(list(categorias))

import pandas as pd
excel_path = r'd:\PROYECTOS\ELREMATE\modificaciones\lista_corregida.xlsx'
df = pd.read_excel(excel_path)
col_categoria = [c for c in df.columns if 'ATEGOR' in str(c)][0]
df_otros = df[df[col_categoria] == 'DESCARTABLES Y ARTÍCULOS DEL HOGAR']
print(len(df_otros))

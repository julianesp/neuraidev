import json
import os

# Directorio donde están los archivos JSON
directory = "/home/neuraidev/Documentos/sites/neuraidev/public"

# Recorremos todos los archivos JSON en el directorio
for filename in os.listdir(directory):
    if filename.endswith('.json'):
        filepath = os.path.join(directory, filename)
        
        try:
            # Leemos el archivo JSON
            with open(filepath, 'r', encoding='utf-8') as file:
                data = json.load(file)
            
            # Aumentamos el precio en 5000 para cada elemento que tenga la propiedad "precio"
            if isinstance(data, dict) and 'accesorios' in data:
                for item in data['accesorios']:
                    if 'precio' in item:
                        item['precio'] += 5000
            
            # Guardamos los cambios
            with open(filepath, 'w', encoding='utf-8') as file:
                json.dump(data, file, ensure_ascii=False, indent=2)
            
            print(f"Archivo {filename} actualizado exitosamente")
            
        except Exception as e:
            print(f"Error procesando {filename}: {str(e)}")

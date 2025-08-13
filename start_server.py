#!/usr/bin/env python3
"""
Script para iniciar el servidor Flask con variables de entorno desde .env
"""
import os
import sys
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Verificar que la API key esté configurada
if not os.getenv('GOOGLE_API_KEY'):
    print("❌ Error: GOOGLE_API_KEY no está configurada en el archivo .env")
    print("Por favor edita el archivo .env y agrega tu Google API Key")
    sys.exit(1)

print("Iniciando servidor con API key configurada...")
print(f"API Key: {os.getenv('GOOGLE_API_KEY')[:10]}...")

# Importar y ejecutar la aplicación
if __name__ == '__main__':
    from src.main import app
    app.run(host='0.0.0.0', port=5002, debug=True)


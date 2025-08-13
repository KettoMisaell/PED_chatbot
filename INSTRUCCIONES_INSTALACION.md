# Instrucciones de Instalación - Sistema de Consulta del Plan de Desarrollo Estatal

## Requisitos Previos

- Python 3.8 o superior
- Node.js 16 o superior
- API Key de Google AI Studio
- Archivo CSV con datos del plan de desarrollo (con columnas: Text, Embeddings)

## Pasos de Instalación

### 1. Preparar el Entorno

```bash
# Extraer el proyecto
tar -xzf plan-desarrollo-chatbot.tar.gz
cd alfonso-reyes-chatbot

# Crear entorno virtual de Python (recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 2. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno

Editar el archivo `.env` y agregar tu Google API Key:

```bash
# Abrir el archivo .env con tu editor preferido
nano .env

# Agregar la siguiente línea:
GOOGLE_API_KEY=tu_api_key_de_google_aqui
```

**Nota**: Para obtener una API Key de Google AI Studio:
1. Visita https://makersuite.google.com/app/apikey
2. Crea una nueva API Key
3. Copia la clave y pégala en el archivo .env

### 4. Preparar los Datos

**Opción A: Usar datos de ejemplo**
```bash
# Cargar los datos de ejemplo incluidos
python utils/add_data.py data/ejemplo_plan_desarrollo.csv
```

**Opción B: Usar tus propios datos**
```bash
# 1. Colocar tu archivo CSV en la carpeta data/
cp /ruta/a/tu/archivo.csv data/

# 2. Cargar los datos (el archivo debe tener columnas: Text, Embeddings)
python utils/add_data.py data/tu_archivo.csv
```

### 5. Construir el Frontend (si es necesario)

Si necesitas modificar el frontend:

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
cp -r dist/* ../src/static/
cd ..
```

### 6. Iniciar el Sistema

```bash
python start_server.py
```

El sistema estará disponible en: http://localhost:5001

## Verificación de la Instalación

1. **Verificar el estado del sistema**:
   Visita http://localhost:5001/api/status

2. **Probar una consulta**:
   ```bash
   curl -X POST http://localhost:5001/api/chat \
     -H "Content-Type: application/json" \
     -d '{"query": "¿Cuáles son los objetivos principales del plan?"}'
   ```

## Solución de Problemas Comunes

### Error: "GOOGLE_API_KEY no está configurada"
- Verificar que el archivo `.env` existe y contiene la API key
- Asegurar que no hay espacios extra en la línea de la API key

### Error: "La base vectorial no está cargada"
- Ejecutar el script para cargar datos: `python utils/add_data.py data/tu_archivo.csv`
- Verificar que el archivo CSV tiene las columnas correctas: Text, Embeddings

### Error de dependencias de Node.js
- Usar `npm install --legacy-peer-deps` en lugar de `npm install`
- Verificar que Node.js sea versión 16 o superior

### Puerto 5001 ocupado
- Cambiar el puerto en `start_server.py` línea: `app.run(host='0.0.0.0', port=5001, debug=True)`
- Usar un puerto diferente como 5002 o 8000

## Agregar Nuevos Datos

Para agregar información adicional al sistema:

```bash
python utils/add_data.py ruta/del/nuevo_archivo.csv
```

**Formato requerido del CSV**:
- Columna `Text`: Texto del documento
- Columna `Embeddings`: Lista de números (embeddings pre-calculados)

Ejemplo:
```csv
Text,Embeddings
"Contenido del plan de desarrollo...","[0.1, 0.2, 0.3, ...]"
```

## Personalización

### Modificar el comportamiento del asistente
Editar `src/routes/chatbot.py` en la función `initialize_chatbot()` para cambiar el prompt del sistema.

### Cambiar el diseño
Los archivos del frontend están en `frontend/src/App.jsx` y usan Tailwind CSS.

## Soporte

Si encuentras problemas:
1. Revisar los logs del servidor en la terminal
2. Verificar que todas las dependencias estén instaladas
3. Confirmar que la API key de Google esté configurada correctamente
4. Asegurar que los datos estén cargados en ChromaDB


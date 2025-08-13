# Sistema de Consulta del Plan de Desarrollo Estatal

Este proyecto es un chatbot basado en RAG (Retrieval-Augmented Generation) especializado en consultas sobre el Plan de Desarrollo Estatal. Utiliza tecnologías de inteligencia artificial para proporcionar respuestas precisas y contextualizadas basadas en el contenido del plan.

## Características

- **Frontend institucional**: Diseño formal y profesional apropiado para un sistema gubernamental
- **Base de datos vectorial**: Utiliza ChromaDB para almacenar y consultar embeddings del documento
- **IA conversacional**: Powered by Google Gemini para generar respuestas naturales y precisas
- **Búsqueda semántica**: Encuentra información relevante usando embeddings de Google

## Estructura del Proyecto

```
alfonso-reyes-chatbot/
├── frontend/                 # Aplicación React con diseño institucional
├── src/                     # Backend Flask
│   ├── routes/
│   │   └── chatbot.py      # Rutas principales del chatbot
│   └── main.py             # Aplicación Flask principal
├── data/
│   └── chroma/             # Base de datos vectorial ChromaDB
├── utils/
│   └── add_data.py         # Script para agregar datos a la BD
├── requirements.txt        # Dependencias Python
├── start_server.py         # Script de inicio del servidor
└── .env                    # Variables de entorno
```

## Instalación

1. **Clonar el repositorio**
   ```bash
   cd alfonso-reyes-chatbot
   ```

2. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar variables de entorno**
   Editar el archivo `.env` y agregar tu Google API Key:
   ```
   GOOGLE_API_KEY=tu_api_key_aqui
   ```

4. **Preparar los datos**
   - Colocar tu archivo CSV con los datos del plan en la carpeta `data/`
   - El CSV debe tener columnas: `Text` y `Embeddings`
   - Ejecutar el script para cargar los datos:
   ```bash
   python utils/add_data.py data/tu_archivo.csv
   ```

5. **Construir el frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

6. **Copiar archivos del frontend al backend**
   ```bash
   cp -r frontend/dist/* src/static/
   ```

## Uso

### Iniciar el servidor
```bash
python start_server.py
```

El sistema estará disponible en `http://localhost:5002`

### Agregar nuevos datos
Para agregar información adicional al sistema:

```bash
python utils/add_data.py ruta/del/nuevo_archivo.csv
```

## API Endpoints

- `GET /api/status` - Verificar estado del sistema
- `POST /api/initialize` - Inicializar el sistema
- `POST /api/chat` - Enviar consulta al chatbot

### Ejemplo de consulta
```json
{
  "query": "¿Cuáles son los objetivos principales del plan de desarrollo?",
  "top_k": 10
}
```

## Personalización

### Modificar el prompt del asistente
Editar el archivo `src/routes/chatbot.py` en la función `initialize_chatbot()` para ajustar el comportamiento del asistente.

### Cambiar el diseño del frontend
Los archivos principales están en `frontend/src/App.jsx` y utilizan Tailwind CSS para el styling.

## Tecnologías Utilizadas

- **Backend**: Flask, LangChain, ChromaDB
- **Frontend**: React, Tailwind CSS, Lucide Icons
- **IA**: Google Gemini, Google Embeddings
- **Base de datos**: ChromaDB (vectorial)

## Notas Importantes

- Asegúrate de tener una API key válida de Google AI Studio
- El archivo CSV debe tener los embeddings pre-calculados
- Los datos se almacenan localmente en ChromaDB
- El sistema requiere conexión a internet para las consultas a Google AI

## Soporte

Para problemas o preguntas sobre el sistema, revisar los logs del servidor o verificar la configuración de la API key.


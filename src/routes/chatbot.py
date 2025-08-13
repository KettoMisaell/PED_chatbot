from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import numpy as np
import pandas as pd
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
import chromadb

chatbot_bp = Blueprint('chatbot', __name__)

# Variables globales para el modelo y datos
embeddings_model = None
vector_store = None
llm = None
chain = None

def initialize_chatbot():
    """
    Inicializa el modelo de embeddings, LLM y la cadena de procesamiento
    """
    global embeddings_model, llm, chain
    
    # Obtener la API key desde variables de entorno
    google_api_key = os.getenv('GOOGLE_API_KEY')
    if not google_api_key:
        raise ValueError("GOOGLE_API_KEY no está configurada en las variables de entorno")
    
    # Crear instancia del modelo de embeddings
    embeddings_model = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", 
        google_api_key=google_api_key
    )
    
    # Crear instancia del LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=google_api_key,
        temperature=0.6
    )
    
    # Crear el prompt template
    output_parser = StrOutputParser()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
        Eres un asistente especializado en el Plan de Desarrollo Estatal. Tu función es ayudar a los usuarios a encontrar información específica y precisa sobre políticas públicas, programas gubernamentales, objetivos estratégicos, metas, indicadores y cualquier otro aspecto contenido en el plan.
        
        Proporciona respuestas claras, precisas y bien estructuradas. Cuando sea posible, cita secciones específicas del plan y proporciona contexto relevante. Mantén un tono profesional y formal, apropiado para un documento gubernamental.
        
        Si la información solicitada no está disponible en el contexto proporcionado, indícalo claramente y sugiere alternativas o información relacionada que sí esté disponible.
        """),
        ("user", """
        CONSULTA: {query}

        INFORMACIÓN RELEVANTE DEL PLAN DE DESARROLLO ESTATAL:
        {relevant_passage}

        RESPUESTA:
        """)
    ])
    
    # Crear la cadena de procesamiento
    chain = prompt | llm | output_parser

def embeddings_fn(text):
    """
    Crea los embeddings dado un texto
    """
    if embeddings_model is None:
        raise ValueError("El modelo de embeddings no ha sido inicializado")
    return embeddings_model.embed_query(text)

def find_best_passages(query, top_k=10):
    """
    Consulta la colección Chroma para obtener los pasajes más similares
    """
    if vector_store is None:
        raise ValueError("La base vectorial no está cargada")
    
    # Obtén los embeddings del query
    query_embedding = embeddings_model.embed_query(query)
    
    # Consulta Chroma
    results = vector_store.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )
    
    # results['documents'] es una lista de listas: [[texto1, texto2, ...]]
    return results['documents'][0]

def load_vector_store():
    """
    Carga la base vectorial de Chroma
    """
    global vector_store
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'chroma'))
    client = chromadb.PersistentClient(path=data_dir)
    vector_store = client.get_or_create_collection(name="plan_desarrollo_estatal")


@chatbot_bp.route('/chat', methods=['POST'])
@cross_origin()
def chat():
    """
    Endpoint principal para el chatbot
    """
    try:
        # Obtener la consulta del usuario
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Se requiere una consulta (query)'}), 400
        
        query = data['query']
        top_k = data.get('top_k', 10)
        
        # Verificar que el sistema esté inicializado
        if embeddings_model is None or chain is None:
            return jsonify({'error': 'El sistema no ha sido inicializado correctamente'}), 500
        
        if vector_store is None:
            return jsonify({'error': 'La base vectorial no está cargada'}), 500
        
        # Obtener los pasajes más relevantes
        top_passages = find_best_passages(query, top_k=top_k)
        
        # Unir los pasajes como un solo texto
        relevant_passage = "\n\n".join(top_passages)
        
        # Invocar la cadena de LangChain
        respuesta = chain.invoke({
            "query": query,
            "relevant_passage": relevant_passage
        })
        
        return jsonify({
            'response': respuesta,
            'passages_used': len(top_passages)
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@chatbot_bp.route('/status', methods=['GET'])
@cross_origin()
def status():
    """
    Endpoint para verificar el estado del sistema
    """
    return jsonify({
        'embeddings_model_loaded': embeddings_model is not None,
        'chain_loaded': chain is not None,
        'data_loaded': vector_store is not None,
        'data_size': vector_store.count() if vector_store else 0
    })

@chatbot_bp.route('/initialize', methods=['POST'])
@cross_origin()
def initialize():
    try:
        initialize_chatbot()
        load_vector_store()
        return jsonify({'message': 'Sistema inicializado correctamente'})
    except Exception as e:
        return jsonify({'error': f'Error al inicializar: {str(e)}'}), 500

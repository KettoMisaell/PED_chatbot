import chromadb
import pandas as pd
import os
import sys
import ast

def add_embeddings_from_csv(csv_path):
    try:
        current_dir = os.path.dirname(__file__)
        persist_dir = os.path.abspath(os.path.join(current_dir, '..', 'data', 'chroma'))

        print(f"🔍 Leyendo archivo: {csv_path}")
        df = pd.read_excel(csv_path)

        # Convertir la columna de embeddings de string a lista
        df['Embeddings'] = df['Embeddings'].apply(ast.literal_eval)

        client = chromadb.PersistentClient(path=persist_dir)
        collection = client.get_or_create_collection(name="plan_desarrollo_estatal")

        initial_count = collection.count()

        print(f"📦 Colección: plan_desarrollo_estatal (documentos antes: {initial_count})")

        new_ids = []
        new_embeddings = []
        new_docs = []

        for idx, row in df.iterrows():
            doc_text = row['Text']
            embedding = row['Embeddings']

            # Crear un ID único basado en nombre del archivo + índice
            unique_id = f"{os.path.basename(csv_path)}_{idx}"

            new_ids.append(unique_id)
            new_embeddings.append(embedding)
            new_docs.append(doc_text)

        collection.add(
            embeddings=new_embeddings,
            documents=new_docs,
            ids=new_ids
        )

        final_count = collection.count()
        print("✅ Datos agregados correctamente")
        print(f"📦 Total de documentos ahora: {final_count}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("⚠️ Uso: python add_data.py ruta/del/archivo.csv")
    else:
        csv_file = sys.argv[1]
        add_embeddings_from_csv(csv_file)



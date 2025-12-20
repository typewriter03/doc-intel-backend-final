import time
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from src.core.config import settings

class VectorDBService:
    def __init__(self):
        if not settings.PINECONE_API_KEY:
             print("⚠️ PINECONE_API_KEY missing! Vector DB will not work.")
             return
             
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME

        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )

        # 2. Check Index Existence
        try:
            existing_indexes = [i.name for i in self.pc.list_indexes()]
            if self.index_name not in existing_indexes:
                print(f"⚡ Creating Pinecone Index: {self.index_name}...")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=settings.EMBEDDING_DIMENSION,
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region="us-east-1")
                )
                while not self.pc.describe_index(self.index_name).status["ready"]:
                    time.sleep(1)
        except Exception as e:
            print(f"⚠️ Pinecone connection error: {e}")

        # 3. Connect LangChain
        try:
            self.vector_store = PineconeVectorStore(
                index_name=self.index_name,
                embedding=self.embeddings
            )
            print(f"✅ Connected to Pinecone Index: {self.index_name}")
        except Exception as e:
             print(f"⚠️ Failed to init VectorStore: {e}")

    def add_documents(self, docs, workflow_id: str):
        if hasattr(self, 'vector_store'):
            self.vector_store.add_documents(
                documents=docs, 
                namespace=workflow_id 
            )
        else:
            print("❌ Cannot add documents: Vector Store not initialized.")

vector_db_service = VectorDBService()
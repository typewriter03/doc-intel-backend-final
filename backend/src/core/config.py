import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Doc Intel API"
    VERSION: str = "1.0.0"

    API_KEY: str = os.environ.get("API_SECRET_KEY", "default_insecure_key")

    OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY")
    LLM_MODEL: str = "gpt-5-mini"

    PINECONE_API_KEY: str = os.environ.get("PINECONE_API_KEY")
    PINECONE_INDEX_NAME: str = os.environ.get("PINECONE_INDEX_NAME", "doc-intel-index")
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    EMBEDDING_DIMENSION: int = 768 

    SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY")

settings = Settings()
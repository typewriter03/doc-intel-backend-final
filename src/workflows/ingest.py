import os
import shutil
import tempfile
from pathlib import Path
from bs4 import BeautifulSoup
from markdownify import markdownify
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pydantic import BaseModel

from src.services.vector_db import vector_db_service
from src.core.parser_pdf import parse_pdf
from src.core.parser_docx import parse_docx
from src.core.parser_csv import csv_parser_function
from src.core.parser_image import parse_image
from src.core.parser_pptx import parse_pptx
from src.core.parser_text import parse_text
from src.services.database import db_service

# Create FastAPI router
router = APIRouter()

def clean_and_convert_html(html_content: str) -> str:
    """
    Cleans Docling HTML and converts to RAG-friendly Markdown.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove noise
    for tag in soup(["script", "style", "meta", "link", "noscript"]):
        tag.decompose()
        
    # Convert to Markdown (Preserves table structure)
    md_content = markdownify(str(soup), heading_style="ATX")
    return md_content

def run_docling_parser(file_path: Path, output_dir: Path, extension: str):
    """
    Routes the file to the correct Docling parser function.
    """
    ext = extension.lower()
    
    if ext == ".pdf":
        parse_pdf(file_path, output_dir)
    elif ext in [".docx", ".doc"]:
        parse_docx(file_path, output_dir)
    elif ext in [".csv", ".xlsx", ".xls"]:
        csv_parser_function(file_path, output_dir)
    elif ext in [".png", ".jpg", ".jpeg"]:
        parse_image(file_path, output_dir)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def process_and_index_document(workflow_id: str, file_content: bytes, filename: str):
    """
    Full Pipeline: Upload -> Docling Parse -> Markdown -> Chunk -> Pinecone.
    """
    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        work_dir = Path(temp_dir)
        input_path = work_dir / filename
        output_path = work_dir / "output"
        output_path.mkdir()

        # 1. Save Input File
        with open(input_path, "wb") as f:
            f.write(file_content)

        print(f"📄 Parsing {filename} using Docling...")

        # 2. Run the appropriate Parser
        try:
            file_ext = Path(filename).suffix
            run_docling_parser(input_path, output_path, file_ext)
        except Exception as e:
            print(f"❌ Parser Error: {e}")
            raise e

        # 3. Read the Result (Docling saves as index.html)
        generated_html_path = output_path / "index.html"
        
        if not generated_html_path.exists():
            raise FileNotFoundError("Parser finished but no 'index.html' was generated.")
            
        with open(generated_html_path, "r", encoding="utf-8") as f:
            raw_html = f.read()

        # 4. Convert to Markdown (The Fix)
        md_text = clean_and_convert_html(raw_html)
        db_service.save_document_content(workflow_id, filename, md_text)

        # 5. Chunking (Aggregator Strategy)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=250,
            separators=["\n\n", "|", "\n", " "] 
        )
        
        docs = [Document(
            page_content=md_text, 
            metadata={"source": filename, "workflow_id": workflow_id}
        )]
        
        split_docs = text_splitter.split_documents(docs)
        print(f"🧩 Split into {len(split_docs)} chunks.")

        # 6. Upload to Pinecone
        vector_db_service.add_documents(split_docs, workflow_id)
        
        return len(split_docs)


# FastAPI Endpoints
class IngestResponse(BaseModel):
    workflow_id: str
    filename: str
    chunks_created: int
    status: str

@router.post("/ingest", response_model=List[IngestResponse])
async def ingest_document(
    workflow_id: str,
    files: List[UploadFile] = File(...)
):
    """
    Endpoint to ingest multiple documents into the vector database.
    
    - Parses each document using Docling
    - Converts to Markdown
    - Chunks the content
    - Stores in Pinecone
    """
    results = []
    
    # Process each file independently
    for file in files:
        try:
            # Read file content
            file_content = await file.read()
            
            # Process and index
            num_chunks = process_and_index_document(
                workflow_id=workflow_id,
                file_content=file_content,
                filename=file.filename
            )
            
            results.append(IngestResponse(
                workflow_id=workflow_id,
                filename=file.filename,
                chunks_created=num_chunks,
                status="success"
            ))
            
        except Exception as e:
            # Log the error but allow other files to proceed (or you could choose to fail all)
            # Here we follow the response model, but we might want to indicate failure.
            # Since IngestResponse has a 'status' field, we can use that.
            print(f"Failed to ingest {file.filename}: {e}")
            results.append(IngestResponse(
                workflow_id=workflow_id,
                filename=file.filename,
                chunks_created=0,
                status=f"failed: {str(e)}"
            ))
            
    return results
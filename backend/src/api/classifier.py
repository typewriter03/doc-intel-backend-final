import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import shutil
import os
from src.core.auth import verify_key
from src.core.ai_classifier import classify_highest_class

# Import parsers
from src.core.parser_pdf import parse_pdf 
from src.core.parser_docx import parse_docx 
from src.core.parser_pptx import parse_pptx
from src.core.parser_text import parse_text
from src.core.parser_image import parse_image

router = APIRouter()

@router.post("/classify")
async def classify_file(file: UploadFile = File(..., description="The file to be classified."), auth_key: str = Form(..., description="Authentication key for access.")):
    """
    Accepts a file (HTML, PDF, DOCX, etc.), converts it if necessary, and classifies it.
    """
    print(f"📥 Received file for classification: {file.filename}")
    
    if not verify_key(auth_key):
        print(f"❌ Invalid auth key provided")
        raise HTTPException(status_code=401, detail="Invalid authentication key")

    # Create a temporary directory for processing
    tmpdir = tempfile.TemporaryDirectory()
    try:
        tmp_path = Path(tmpdir.name)
        input_file_path = tmp_path / file.filename
        
        # Save uploaded file
        content = await file.read()
        with open(input_file_path, "wb") as f:
            f.write(content)

        suffix = input_file_path.suffix.lower()
        target_html_path = input_file_path # Default to input if it's already HTML

        # Parsing Logic
        if suffix in ['.html', '.htm']:
            target_html_path = input_file_path
        elif suffix == '.pdf':
            print(f"🔄 Converting PDF to HTML for classification...")
            parse_pdf(input_file_path, tmp_path)
            target_html_path = tmp_path / "index.html"
        elif suffix in ['.docx', '.doc']:
             print(f"🔄 Converting DOCX to HTML for classification...")
             parse_docx(input_file_path, tmp_path)
             target_html_path = tmp_path / "index.html"
        elif suffix == '.pptx':
             print(f"🔄 Converting PPTX to HTML for classification...")
             parse_pptx(input_file_path, tmp_path)
             target_html_path = tmp_path / "index.html"
        elif suffix in ['.txt', '.md']:
             print(f"🔄 Converting Text to HTML for classification...")
             parse_text(input_file_path, tmp_path)
             # parse_text might produce a different output structure, let's check.
             # Based on parser.py review, it seems most parsers follow the docling pattern which saves as HTML.
             # If parse_text doesn't generate index.html, we might need a fallback, but let's assume standard behavior for now from parser_pdf/docx.
             target_html_path = tmp_path / "index.html"
        elif suffix in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
             print(f"🔄 Converting Image to HTML for classification...")
             parse_image(input_file_path, tmp_path)
             target_html_path = tmp_path / "index.html"
        else:
             print(f"❌ Unsupported file type: {suffix}")
             raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")

        if not target_html_path.exists():
             # Fallback: look for any HTML file (e.g. for text parser which generates filename.html)
             html_files = list(tmp_path.glob("*.html"))
             if html_files:
                 target_html_path = html_files[0]
             else:
                 raise HTTPException(status_code=500, detail="Parser failed to generate HTML output for classification.")

        # Run classification on the resulting HTML (original or converted)
        classification = classify_highest_class(target_html_path)
        print(f"✅ Classification successful: {classification}")
        return {"filename": file.filename, "classification": classification}

    except Exception as e:
        print(f"❌ Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
    
    finally:
        # Cleanup
        tmpdir.cleanup()

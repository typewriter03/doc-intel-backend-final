import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import shutil
import os
from src.classify_raw.classify import classify_highest_class
router = APIRouter()

@router.post("/classify")
async def classify_file(file: UploadFile = File(..., description="The HTML file to be classified."), auth_key: str = Form(..., description="Authentication key for access.")):
    """
    Accepts an HTML file, runs the classifier, and returns the highest probability class.
    """
    if not file.filename.endswith(('.html', '.htm')):
        raise HTTPException(status_code=400, detail="Only HTML files are supported.")

    if not verify_key(auth_key):
        # 401 Unauthorized is the correct response for authentication failure
        raise HTTPException(status_code=401, detail="Invalid authentication key")

    # Create a temporary file to save the uploaded content
    with tempfile.NamedTemporaryFile(delete=False, suffix=".html") as tmp:
        try:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not save uploaded file. Error: {str(e)}")

    try:
        # Run classification
        # get_highest_class expects a file path
        classification = classify_highest_class(tmp_path)
        return {"filename": file.filename, "classification": classification}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")
    
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

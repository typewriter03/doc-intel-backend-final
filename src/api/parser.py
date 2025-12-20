import shutil
import tempfile
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse

from src.core.parser_pdf import parse_pdf 
from src.core.parser_csv import csv_parser_function
from src.core.parser_docx import parse_docx 
from src.core.parser_pptx import parse_pptx
from src.core.parser_text import parse_text
from src.core.parser_image import parse_image
from src.core.utils import utils_apply
# Initialize the router
router = APIRouter()

def cleanup(tmpdir: tempfile.TemporaryDirectory | None, zip_path: Path | None):
    """Background cleanup after file is sent."""
    # This function is executed after the FileResponse stream completes.
    if tmpdir:
        print("Cleaning up temporary directory...")
        tmpdir.cleanup()
    if zip_path and zip_path.exists():
        print("Removing temporary ZIP file...")
        zip_path.unlink(missing_ok=True)

@router.post("/parse")
async def parse_docs_endpoint(
    # BackgroundTasks allows cleanup function to run after the response is streamed
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(..., description="The file to be parsed."),
    auth_key: str = Form(..., description="Authentication key for access."),
    output_path: str = Form(None, description="Optional path to save results permanently instead of a temp folder.")
):
    """
    Accepts a file and authentication key, runs the parser, 
    and returns the processed HTML + assets as a ZIP archive.
    """
    # 1. Key Validation (Security)
    if not verify_key(auth_key):
        # 401 Unauthorized is the correct response for authentication failure
        raise HTTPException(status_code=401, detail="Invalid authentication key")
    
    # 2. Determine and Setup Output Folder
    tmpdir = None
    if output_path:
        out_dir = Path(output_path)
        # Ensure permanent directory exists
        out_dir.mkdir(parents=True, exist_ok=True)
    else:
        # Create a temporary directory that will be cleaned up later
        tmpdir = tempfile.TemporaryDirectory()
        out_dir = Path(tmpdir.name)
    
    # 3. Save Input File
    # filename = Path(file.filename).name   # removes paths
    # input_pdf = out_dir / filename
    input_pdf = out_dir / file.filename
    try:
        # FastAPI's await file.read() reads the entire file into memory (good for smaller files)
        # For very large files, stream in chunks (more complex implementation)
        file_content = await file.read()
        with open(input_pdf, "wb") as f:
            f.write(file_content)
    except Exception as e:
        # If saving fails, clean up temp dir if it exists
        if tmpdir:
            tmpdir.cleanup()
        raise HTTPException(status_code=500, detail=f"Could not save uploaded file. Error: {str(e)}")

    # 4. Run Core Parser
    try:
        # Check file extension and route to appropriate parser
        suffix = input_pdf.suffix.lower()
        if suffix in ['.csv', '.xlsx', '.xls']:
            print(f"Routing to CSV parser for {suffix} file...")
            csv_parser_function(input_pdf, out_dir)
        elif suffix == '.pdf':
            print(f"Routing to PDF parser for {suffix} file...")
            parse_pdf(input_pdf, out_dir)
        elif suffix in ['.docx', '.doc']:
            print(f"Routing to DOCX parser for {suffix} file...")
            parse_docx(input_pdf, out_dir)
        elif suffix == '.pptx':
            print(f"Routing to PPTX parser for {suffix} file...")
            parse_pptx(input_pdf, out_dir)
        elif suffix in ['.txt', '.md'] :
            print(f"Routing to text parser for {suffix} file...")
            parse_text(input_pdf, out_dir)
        elif suffix in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']:
            print(f"Routing to image parser for {suffix} file...")
            parse_image(input_pdf, out_dir)
        else:
             raise HTTPException(status_code=400, detail=f"Unsupported file format: {suffix}")
        
        # Optional: Clean up the input  within the output directory
        input_pdf.unlink(missing_ok=True)

    except HTTPException as e:
        if tmpdir:
            tmpdir.cleanup()
        raise e
    except Exception as e:
        # If parser fails, clean up temp dir
        if tmpdir:
            tmpdir.cleanup()
        raise HTTPException(status_code=500, detail=f"Parser execution failed: {type(e).__name__} - {str(e)}")

    # 5. Create ZIP Archive
    try:
        # Create ZIP in a general temp location (outside of out_dir)
        # zip_base = Path(tempfile.gettempdir()) / f"{input_pdf.stem}_parsed"
        # shutil.make_archive zips the contents of out_dir and returns the path to the zip file
        # zip_path = Path(shutil.make_archive(str(zip_base), "zip", out_dir))
       #rename and remove stuff
        utils_apply(out_dir)

        zip_path = Path(tempfile.gettempdir()) / "file.zip"
        shutil.make_archive(zip_path.with_suffix(""), "zip", out_dir)

    except Exception as e:
        if tmpdir:
            tmpdir.cleanup()
        raise HTTPException(status_code=500, detail=f"Failed to create ZIP archive: {str(e)}")

    # 6. Return FileResponse with Cleanup
    # Add the cleanup function to run in the background after the file is sent
    background_tasks.add_task(cleanup, tmpdir, zip_path)
    
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="file.zip"
    )

async def get_document_text(file_content: bytes, filename: str) -> str:
    """
    Reuses existing parser logic to convert a file to a Markdown string.
    """
    # Create a temporary directory that cleans itself up when we are done
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        input_file = temp_path / filename
        
        # 1. Write the bytes to a real file (because your parsers expect a file path)
        with open(input_file, "wb") as f:
            f.write(file_content)
        
        # 2. Route to your existing parsers based on extension
        # (This logic is copied directly from your parser.py)
        suffix = input_file.suffix.lower()
        
        try:
            if suffix in ['.csv', '.xlsx', '.xls']:
                csv_parser_function(input_file, temp_path)
            elif suffix == '.pdf':
                parse_pdf(input_file, temp_path)
            elif suffix in ['.docx', '.doc']:
                parse_docx(input_file, temp_path)
            elif suffix == '.pptx':
                parse_pptx(input_file, temp_path)
            elif suffix in ['.txt', '.md']:
                parse_text(input_file, temp_path)
            elif suffix in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
                parse_image(input_file, temp_path)
            else:
                raise ValueError(f"Unsupported file format: {suffix}")
                
            # 3. Read the output back into a string
            # Your parsers write the result into 'temp_path'. 
            # We look for the generated Markdown (.md) file to return to the LLM.
            md_files = list(temp_path.glob("*.md"))
            
            if md_files:
                # If multiple exist, usually the first one is the main content
                return md_files[0].read_text(encoding="utf-8")
            else:
                # Fallback: specific parsers might output .txt or .csv
                txt_files = list(temp_path.glob("*.txt"))
                if txt_files:
                     return txt_files[0].read_text(encoding="utf-8")
                
                return "" # Return empty string if parsing failed to produce text

        except Exception as e:
            print(f"Parser Error: {e}")
            raise e
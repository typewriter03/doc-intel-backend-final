import re
import os
import shutil
import random
import string
import tempfile
from pathlib import Path
from fastapi import UploadFile

# Import your existing parsers
# We assume these exist based on your previous 'parser.py'
from src.core.parser_pdf import parse_pdf 
from src.core.parser_csv import csv_parser_function
from src.core.parser_docx import parse_docx
from src.core.parser_text import parse_text

async def parse_file_to_string(file: UploadFile) -> str:
    """
    Wrapper for Phase 1 Ingestion: 
    Saves upload -> Runs Legacy Parser -> Reads output -> Returns String.
    
    This allows us to reuse your existing Docling/Pandas parsers 
    but get the text back in memory for the LLM.
    """
    # 1. Setup Temp Directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        input_path = temp_path / file.filename
        
        # 2. Save Uploaded File
        try:
            content = await file.read()
            with open(input_path, "wb") as f:
                f.write(content)
        except Exception as e:
            return f"Error saving file: {str(e)}"
            
        # 3. Determine Type & Run Parser
        suffix = input_path.suffix.lower()
        
        try:
            # We reuse the logic from your parser.py
            if suffix == '.pdf':
                # detailed=True usually produces better markdown in Docling
                parse_pdf(input_path, temp_path) 
            elif suffix in ['.csv', '.xls', '.xlsx']:
                csv_parser_function(input_path, temp_path)
            elif suffix in ['.docx', '.doc']:
                parse_docx(input_path, temp_path)
            elif suffix in ['.txt', '.md']:
                parse_text(input_path, temp_path)
            else:
                return f"Error: Unsupported file type {suffix}"
                
            # 4. Find the Output File
            # Your parsers write to disk. We need to find the text/markdown file they created.
            # Priority: Markdown (.md) -> Text (.txt) -> HTML (.html)
            
            output_file = None
            for ext in ["*.md", "*.txt", "*.html"]:
                found = list(temp_path.glob(ext))
                if found:
                    output_file = found[0]
                    break
            
            if output_file:
                # Read the content back into memory
                return output_file.read_text(encoding="utf-8")
            else:
                return "Error: Parser ran but no text/markdown output was found."

        except Exception as e:
            return f"Error during parsing: {str(e)}"

# --- YOUR EXISTING FUNCTIONS BELOW (UNCHANGED) ---

def modify_html(folder_path: Path):
    """
    Modifies HTML file to rename and move images from subdirectories to main folder.
    """
    folder_path = Path(folder_path)
    
    # Find the HTML file in the folder
    html_files = list(folder_path.glob("*.html"))
    if not html_files:
        print("No HTML file found in the folder")
        return
    
    html_file = html_files[0]
    
    # Read the HTML content
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find all image references in the HTML
    img_pattern = r'<img\s+src="([^"]+)"'
    matches = re.finditer(img_pattern, html_content)
    
    # Process each image
    for match in matches:
        old_path = match.group(1)
        
        # Get the full path to the image
        img_full_path = folder_path / old_path
        
        if not img_full_path.exists():
            print(f"Warning: Image not found: {img_full_path}")
            continue
        
        # Get the file extension
        extension = img_full_path.suffix
        
        # Generate a unique random 10-character name
        random_name = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        new_filename = f"{random_name}{extension}"
        
        # Ensure the new name is unique
        new_path = folder_path / new_filename
        while new_path.exists():
            random_name = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
            new_filename = f"{random_name}{extension}"
            new_path = folder_path / new_filename
        
        # Copy the image to the main folder
        shutil.copy2(img_full_path, new_path)
        print(f"Copied: {old_path} -> {new_filename}")
        
        # Update the HTML content
        html_content = html_content.replace(f'src="{old_path}"', f'src="{new_filename}"')
    
    # Write the modified HTML back to the file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"HTML file updated: {html_file}")


def clear_subfolders(folder_path):
    for item in os.listdir(folder_path):
        full_path = os.path.join(folder_path, item)
        if os.path.isdir(full_path):
            shutil.rmtree(full_path)  

def clean_folder(folder_path: Path):
    """
    Remove everything including subfolders except HTML and images referenced in it.
    """
    folder_path = Path(folder_path)
    
    # Find the HTML file
    html_files = list(folder_path.glob("*.html"))
    if not html_files:
        print("No HTML file found in the folder")
        return
    
    html_file = html_files[0]
    
    # Read the HTML content
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Find all image references in the HTML
    img_pattern = r'<img\s+src="([^"]+)"'
    referenced_images = set(re.findall(img_pattern, html_content))
    
    # Convert to full paths and normalize
    referenced_paths = set()
    referenced_paths.add(html_file.resolve())  # Keep the HTML file
    
    for img_ref in referenced_images:
        img_path = (folder_path / img_ref).resolve()
        referenced_paths.add(img_path)
        
    all_items = list(folder_path.rglob("*"))
    
    deleted_count = 0
    for item in all_items:
        item_resolved = item.resolve()

        if item_resolved in referenced_paths:
            continue
        
        if any(str(keep_path).startswith(str(item_resolved)) and keep_path != item_resolved 
               for keep_path in referenced_paths):
            continue
        
        # Delete the item
        try:
            if item.is_file():
                item.unlink()
                deleted_count += 1
            elif item.is_dir():
                try:
                    item.rmdir()
                    deleted_count += 1
                except OSError:
                    pass
        except Exception as e:
            print(f"Error deleting {item}: {e}")
    
    # Second pass to clean up empty directories
    for item in sorted(folder_path.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if item.is_dir() and not any(item.iterdir()):
            try:
                item.rmdir()
                print(f"Deleted empty folder: {item.relative_to(folder_path)}")
            except Exception as e:
                print(f"Error deleting empty folder {item}: {e}")

def utils_apply(FolderPath: Path):
    modify_html(FolderPath)
    clean_folder(FolderPath)
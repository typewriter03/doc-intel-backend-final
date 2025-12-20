import logging
import os
import shutil
import urllib.parse
from pathlib import Path
import warnings
import re

from docling_core.types.doc import ImageRefMode, PictureItem, TableItem
from docling.document_converter import DocumentConverter

warnings.filterwarnings("ignore", category=UserWarning)

# Initialize logger
logger = logging.getLogger("pptx_parser")

# Subfolders for images and tables
FIGURES_SUBFOLDER = "figures"
TABLES_SUBFOLDER = "tables"

def _ensure_dir(base_dir: Path, subfolder: str) -> Path:
    p = base_dir / subfolder
    p.mkdir(parents=True, exist_ok=True)
    return p

def _copy_into_images(found: Path, out_dir: Path, images_dir: Path, cache: dict) -> str:
    fpath = found.resolve()
    if fpath in cache:
        return cache[fpath]

    dest = images_dir / found.name
    i = 1
    while dest.exists():
        dest = images_dir / f"{found.stem}_{i}{found.suffix}"
        i += 1

    shutil.copy2(found, dest)
    rel = os.path.relpath(dest, start=out_dir).replace("\\", "/")
    cache[fpath] = rel
    return rel

def _fix_html_image_refs(html_path: Path, out_dir: Path, cache: dict):
    if not html_path.exists():
        return

    html = html_path.read_text(encoding="utf-8")
    html = urllib.parse.unquote(html)
    
    src_re = re.compile(r'src=(["\'])(.*?)\1', flags=re.IGNORECASE)

    def repl(m):
        orig = m.group(2)
        if orig.startswith(("data:", "http://", "https://")):
            return m.group(0)
        decoded = orig.replace("\\", "/")
        candidates = [Path(decoded), out_dir / decoded, Path.cwd() / decoded]

        found = None
        for c in candidates:
            if c.exists():
                try:
                    found = c.resolve()
                    break
                except OSError:
                    pass

        if not found:
            fname = Path(decoded).name
            for p in out_dir.rglob(fname):
                try:
                    found = p.resolve()
                    break
                except OSError:
                    pass

        if not found:
            return f'src="{decoded}"'

        figures_dir = out_dir / FIGURES_SUBFOLDER
        figures_dir.mkdir(parents=True, exist_ok=True)
        
        rel = _copy_into_images(found, out_dir, figures_dir, cache)
        return f'src="{rel}"'

    fixed = src_re.sub(repl, html)
    html_path.write_text(fixed, encoding="utf-8")
    return html_path

# ---------------------------
# PPTX PARSER FUNCTION
# ---------------------------
def parse_pptx(INPUT_FILE: Path, OUT_DIR: Path):
    if not INPUT_FILE.exists():
        logger.error("File not found: %s", INPUT_FILE.resolve())
        raise FileNotFoundError(f"File not found: {INPUT_FILE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    
    copied_images_cache = {}

    figures_dir = _ensure_dir(OUT_DIR, FIGURES_SUBFOLDER)
    tables_dir = _ensure_dir(OUT_DIR, TABLES_SUBFOLDER)

    converter = DocumentConverter()
    logger.info("Converting '%s' ...", INPUT_FILE.name)
    
    try:
        conv_res = converter.convert(INPUT_FILE)
        doc = conv_res.document

        items = list(doc.iterate_items())
        pictures = [el for el, _ in items if isinstance(el, PictureItem)]
        tables = [el for el, _ in items if isinstance(el, TableItem)]
        logger.info("Found %d pictures and %d tables", len(pictures), len(tables))

        # Save pictures
        for i, el in enumerate(pictures, start=1):
            dest = figures_dir / f"{INPUT_FILE.stem}-picture-{i}.png"
            img = el.get_image(doc)
            if img:
                img.save(dest, "PNG")
                copied_images_cache[dest.resolve()] = f"{FIGURES_SUBFOLDER}/{dest.name}"

        # Save tables as image + CSV
        for i, el in enumerate(tables, start=1):
            dest_img = tables_dir / f"{INPUT_FILE.stem}-table-{i}.png"
            img = el.get_image(doc)
            if img:
                img.save(dest_img, "PNG")
                copied_images_cache[dest_img.resolve()] = f"{TABLES_SUBFOLDER}/{dest_img.name}"

            try:
                df = el.export_to_dataframe(doc)
                csv_path = tables_dir / f"{INPUT_FILE.stem}-table-{i}.csv"
                df.to_csv(csv_path, index=False)
            except Exception as e:
                logger.warning("Could not export table %d as CSV: %s", i, e)

        # md_file = OUT_DIR / f"{INPUT_FILE.stem}-with-image-refs.md"
        html_file = OUT_DIR / "index.html"
        # doc.save_as_markdown(md_file, image_mode=ImageRefMode.REFERENCED)
        doc.save_as_html(html_file, image_mode=ImageRefMode.REFERENCED)

        _fix_html_image_refs(html_file, OUT_DIR, copied_images_cache)
        logger.info("Done! Open %s in browser to view output.", html_file)
        
    except Exception as e:
        logger.error(f"PPTX conversion failed: {e}")
        raise e


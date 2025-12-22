import logging
import os
import shutil
import urllib.parse
from pathlib import Path
import warnings

from docling_core.types.doc import ImageRefMode, PictureItem, TableItem
from docling.document_converter import DocumentConverter

warnings.filterwarnings("ignore", category=UserWarning)


INPUT_IMAGE = Path("sample_image.png")  # Supported: PNG, JPEG, TIFF, etc.
OUT_DIR = Path("output_image")

FIGURES_SUBFOLDER = "figures"
TABLES_SUBFOLDER = "tables"

# OUT_DIR.mkdir(parents=True, exist_ok=True)

logger = logging.getLogger("image_parser")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

copied_images_cache = {}

# ---------------------------
# HELPERS
# ---------------------------
def _ensure_dir(subfolder: str) -> Path:
    p = OUT_DIR / subfolder
    p.mkdir(parents=True, exist_ok=True)
    return p

def _remove_empty_dirs(base_dir: Path):
    """Remove empty subdirectories within base_dir."""
    for subfolder in [FIGURES_SUBFOLDER, TABLES_SUBFOLDER]:
        folder_path = base_dir / subfolder
        if folder_path.exists() and folder_path.is_dir():
            # Check if directory is empty
            if not any(folder_path.iterdir()):
                folder_path.rmdir()
                logger.info("Removed empty folder: %s", folder_path)

def _copy_into_images(found: Path, images_dir: Path) -> str:
    fpath = found.resolve()
    if fpath in copied_images_cache:
        return copied_images_cache[fpath]

    dest = images_dir / found.name
    i = 1
    while dest.exists():
        dest = images_dir / f"{found.stem}_{i}{found.suffix}"
        i += 1

    shutil.copy2(found, dest)
    rel = os.path.relpath(dest, start=OUT_DIR).replace("\\", "/")
    copied_images_cache[fpath] = rel
    return rel

def _fix_html_image_refs(html_path: Path):
    html = html_path.read_text(encoding="utf-8")
    html = urllib.parse.unquote(html)
    
    import re
    src_re = re.compile(r'src=(["\'])(.*?)\1', flags=re.IGNORECASE)

    def repl(m):
        orig = m.group(2)
        if orig.startswith(("data:", "http://", "https://")):
            return m.group(0)
        decoded = orig.replace("\\", "/")
        candidates = [Path(decoded), OUT_DIR / decoded, Path.cwd() / decoded]

        found = None
        for c in candidates:
            if c.exists():
                found = c.resolve()
                break

        if not found:
            fname = Path(decoded).name
            for p in OUT_DIR.rglob(fname):
                found = p.resolve()
                break

        if not found:
            return f'src="{decoded}"'

        rel = _copy_into_images(found, OUT_DIR / FIGURES_SUBFOLDER)
        return f'src="{rel}"'

    fixed = src_re.sub(repl, html)
    html_path.write_text(fixed, encoding="utf-8")
    return html_path

# ---------------------------
# IMAGE PARSER FUNCTION
# ---------------------------
def parse_image(INPUT_IMAGE: Path, OUT_DIR: Path):
    if not INPUT_IMAGE.exists():
        logger.error("File not found: %s", INPUT_IMAGE.resolve())
        return

    figures_dir = _ensure_dir(FIGURES_SUBFOLDER)
    tables_dir = _ensure_dir(TABLES_SUBFOLDER)

    converter = DocumentConverter()
    logger.info("Converting '%s' ...", INPUT_IMAGE.name)
    conv_res = converter.convert(INPUT_IMAGE)
    doc = conv_res.document

    items = list(doc.iterate_items())
    pictures = [el for el, _ in items if isinstance(el, PictureItem)]
    tables = [el for el, _ in items if isinstance(el, TableItem)]
    logger.info("Found %d pictures and %d tables", len(pictures), len(tables))

    # Save pictures (if Docling extracts any)
    for i, el in enumerate(pictures, start=1):
        dest = figures_dir / f"{INPUT_IMAGE.stem}-picture-{i}.png"
        img = el.get_image(doc)
        if img:
            img.save(dest, "PNG")
            copied_images_cache[dest.resolve()] = f"{FIGURES_SUBFOLDER}/{dest.name}"

    # Save tables as images and CSV
    for i, el in enumerate(tables, start=1):
        dest_img = tables_dir / f"{INPUT_IMAGE.stem}-table-{i}.png"
        img = el.get_image(doc)
        if img:
            img.save(dest_img, "PNG")
            copied_images_cache[dest_img.resolve()] = f"{TABLES_SUBFOLDER}/{dest_img.name}"
        try:
            df = el.export_to_dataframe(doc)
            csv_path = tables_dir / f"{INPUT_IMAGE.stem}-table-{i}.csv"
            df.to_csv(csv_path, index=False)
        except Exception as e:
            logger.warning("Could not export table %d as CSV: %s", i, e)

    # Save Markdown and HTML
    # md_file = OUT_DIR / f"{INPUT_IMAGE.stem}-with-image-refs.md"
    html_file = OUT_DIR / "index.html"

    # doc.save_as_markdown(md_file, image_mode=ImageRefMode.REFERENCED)
    doc.save_as_html(html_file, image_mode=ImageRefMode.REFERENCED)

    _fix_html_image_refs(html_file)

    # Clean up empty directories
    _remove_empty_dirs(OUT_DIR)

    logger.info("Done! Open %s in browser to view output.", html_file)
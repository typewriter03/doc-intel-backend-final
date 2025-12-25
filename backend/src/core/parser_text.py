import logging
from pathlib import Path
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

logger = logging.getLogger("txt_parser")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


def txt_to_html(txt_file: Path, html_file: Path):
    """Convert plain text file to HTML while preserving spacing."""
    try:
        with txt_file.open("r", encoding="utf-8") as f:
            content = f.read()
        # Replace line breaks with <br> for HTML
        html_content = "<html><body><pre>{}</pre></body></html>".format(content)
        html_file.parent.mkdir(parents=True, exist_ok=True)
        with html_file.open("w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info("TXT to HTML conversion successful: %s", html_file)
    except Exception as e:
        logger.error("Failed to convert TXT to HTML: %s", e)
        raise e


def parse_text(INPUT_FILE: Path, OUT_DIR: Path):
    """
    Parse Markdown (.md) using Docling and TXT (.txt) directly to HTML.
    """
    if not INPUT_FILE.exists():
        logger.error("File not found: %s", INPUT_FILE.resolve())
        raise FileNotFoundError(f"File not found: {INPUT_FILE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if INPUT_FILE.suffix.lower() == '.md':
        from docling_core.types.doc import ImageRefMode
        from docling.document_converter import DocumentConverter

        logger.info("Processing Markdown file '%s' ...", INPUT_FILE.name)
        try:
            converter = DocumentConverter()
            conv_res = converter.convert(INPUT_FILE)
            doc = conv_res.document

            # md_file = OUT_DIR / f"{INPUT_FILE.stem}.md"
            html_file = OUT_DIR / "index.html"

            # doc.save_as_markdown(md_file, image_mode=ImageRefMode.REFERENCED)
            doc.save_as_html(html_file, image_mode=ImageRefMode.REFERENCED)

            logger.info("Conversion successful!")
            # logger.info("Markdown: %s", md_file)
            logger.info("HTML: %s", html_file)

        except Exception as e:
            logger.error(f"Markdown conversion failed: {e}")
            raise e
    elif INPUT_FILE.suffix.lower() == '.txt':
        logger.info("Converting TXT file '%s' to HTML ...", INPUT_FILE.name)
        html_file = OUT_DIR / f"{INPUT_FILE.stem}.html"
        txt_to_html(INPUT_FILE, html_file)
    else:
        logger.warning("Unsupported file type: %s", INPUT_FILE.suffix)


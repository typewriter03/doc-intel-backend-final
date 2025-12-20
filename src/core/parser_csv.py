from docling.datamodel.base_models import InputFormat
from docling.document_converter import DocumentConverter
from pathlib import Path
import logging

# Initialize logger
logger = logging.getLogger("parser")

def csv_parser_function(INPUT_CSV: Path, OUT_DIR: Path):
    # Initialize converter inside or outside, depending on if we want to reuse it.
    # Reusing it is generally better if it's heavy, but for now we can keep it here or inside.
    # Based on pdf parser, it creates a new one each time or uses a global one? 
    # PDF parser creates it inside. Let's do the same for consistency or keep it global if valid.
    # The original file had it global. Let's keep it global for now but maybe move it inside if needed.
    converter = DocumentConverter()

    input_path = INPUT_CSV
    if not input_path.exists():
        logger.error(f"Error: File '{INPUT_CSV}' not found!")
        raise FileNotFoundError(f"File '{INPUT_CSV}' not found!")

    file_ext = input_path.suffix.lower()
    supported_formats = ['.csv', '.xlsx', '.xls']

    if file_ext not in supported_formats:
        logger.error(f"Error: Unsupported format '{file_ext}'")
        raise ValueError(f"Unsupported format '{file_ext}'. Supported: {', '.join(supported_formats)}")

    logger.info(f"Converting '{INPUT_CSV}'...")

    try:
        res = converter.convert(str(input_path))
        
        # Confidence reporting
        conf = res.confidence
        conf_report_path = OUT_DIR / "confidence_report.txt"
        
        logger.info("\n=== DOCUMENT-LEVEL CONFIDENCE ===")
        logger.info(f"Mean Grade: {conf.mean_grade}")
        logger.info(f"Low Grade: {conf.low_grade}")
        logger.info(f"Mean Score: {conf.mean_score:.3f}")
        logger.info(f"Low Score: {conf.low_score:.3f}")
        
        logger.info("\n--- Component Scores ---")
        logger.info(f"Layout: {conf.layout_score:.3f}")
        logger.info(f"OCR: {conf.ocr_score:.3f}")
        
        logger.info("\n=== PAGE-LEVEL CONFIDENCE SCORES ===")
        for page_no, p in conf.pages.items():
            logger.info(f"Page {page_no}:")
            logger.info(f"  Layout Score: {p.layout_score:.3f}")
            logger.info(f"  OCR Score: {p.ocr_score:.3f}")
            logger.info(f"  Mean Score: {p.mean_score:.3f}")
            logger.info(f"  Low Score: {p.low_score:.3f}")
        
        # Write confidence report to file
        with open(conf_report_path, "w", encoding="utf-8") as f:
            f.write("=== DOCUMENT-LEVEL CONFIDENCE ===\n")
            f.write(f"Mean Grade: {conf.mean_grade}\n")
            f.write(f"Low Grade: {conf.low_grade}\n\n")
            
            f.write(f"Mean Score: {conf.mean_score:.3f}\n")
            f.write(f"Low Score: {conf.low_score:.3f}\n\n")
            
            f.write("--- Component Scores ---\n")
            f.write(f"Layout: {conf.layout_score:.3f}\n")
            f.write(f"OCR: {conf.ocr_score:.3f}\n")
            
            f.write("\n=== PAGE-LEVEL CONFIDENCE SCORES ===\n")
            for page_no, p in conf.pages.items():
                f.write(f"\nPage {page_no}:\n")
                f.write(f"  Layout Score: {p.layout_score:.3f}\n")
                f.write(f"  OCR Score: {p.ocr_score:.3f}\n")
                f.write(f"  Mean Score: {p.mean_score:.3f}\n")
                f.write(f"  Low Score: {p.low_score:.3f}\n")
        
        logger.info(f"\nConfidence report saved: {conf_report_path}")
        
        # Create output filenames based on input filename
        base_name = input_path.stem  # filename without extension
        # md_file = OUT_DIR / f"{base_name}.md"
        html_file = OUT_DIR / "index.html"
        
        # Save as Markdown
        logger.info(f"\nSaving Markdown...")
        # res.document.save_as_markdown(str(md_file))
        
        # Save as HTML
        logger.info(f"Saving HTML...")
        res.document.save_as_html(str(html_file))
        
        logger.info(f"\nConversion successful!")
        # logger.info(f"Markdown: {md_file}")
        logger.info(f"HTML: {html_file}")
        logger.info(f"Output dir: {OUT_DIR}")
        
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise e
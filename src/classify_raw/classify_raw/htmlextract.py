# htmlextract.py
from bs4 import BeautifulSoup

def extract_text_from_html(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(" ", strip=True)
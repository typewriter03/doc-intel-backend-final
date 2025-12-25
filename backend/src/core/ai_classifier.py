from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from bs4 import BeautifulSoup
import re
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
  PROJECT_NAME: str = "Doc Intel API"
  VERSION: str = "1.0.0"
  API_KEY: str = os.environ.get("API_SECRET_KEY", "default_insecure_key")

  OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY")
  LLM_MODEL: str = "gpt-5-mini"

  PINECONE_API_KEY: str = os.environ.get("PINECONE_API_KEY")
  PINECONE_INDEX_NAME: str = os.environ.get("PINECONE_INDEX_NAME", "doc-intel-index")
  EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
  EMBEDDING_DIMENSION: int = 768 

  SUPABASE_URL: str = os.environ.get("SUPABASE_URL")
  SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY")

settings = Settings()

def extract_text_from_html(path):
  with open(path, "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

  soup = BeautifulSoup(html, "html.parser")
  return soup.get_text(" ", strip=True)

llm = ChatOpenAI(
  model_name="gpt-4o",
  api_key=settings.OPENAI_API_KEY
)


def clean_text(text):
  text = re.sub(r"\s+", " ", text)
  text = re.sub(r"[^\x00-\x7F]+", " ", text)
  return text.strip()

from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
  ("system",
   "You are a document classifier. "
   "You must classify the given text into EXACTLY ONE of the following labels:\n"
   "receipt, payslip, invoice, purchase_order, financial_statement, meeting_notes, unknown\n\n"
   "Rules:\n"
   "- Respond with ONLY ONE WORD\n"
   "- Do NOT explain\n"
   "- Do NOT add punctuation\n"
   "- Do NOT add extra text\n"
   "- If the document does not clearly match any category, return 'unknown'"),
  
  ("user",
   "{text}")
])

def classify_highest_class(path, return_debug=False):
  raw = extract_text_from_html(path)
  text = clean_text(raw)

  response = llm.invoke(
    prompt.format_messages(text=text)
  )

  label = response.content.strip()

  if return_debug:
    return {
      "label": label,
      "text_preview": text[:500]
    }

  return label


# if __name__ == "__main__":
#  test_file = "tests/invoice.html" # change path
#  label = classify_html_ai(test_file, return_debug=True)
#  print("Predicted label:", label["label"])
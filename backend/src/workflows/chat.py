import json
from collections import defaultdict
from typing import List, Tuple, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.core.config import settings
from src.services.database import db_service
from src.services.vector_db import vector_db_service

llm = ChatOpenAI(
    temperature=0, 
    model_name="gpt-4o",
    api_key=settings.OPENAI_API_KEY
)

llm_cheap = ChatOpenAI(
    temperature=0, 
    model_name="gpt-4o-mini",
    api_key=settings.OPENAI_API_KEY
)

# --- 1. CHAT (Standard) ---
def retrieve_and_chat(workflow_id: str, query: str, output_format: str = "text"):
    
    # Retrieve Client Docs ONLY
    def search_client_docs(q: str) -> Tuple[str, List[str], int]:
        retriever = vector_db_service.vector_store.as_retriever(
            search_kwargs={"k": 15, "namespace": workflow_id}
        )
        docs = retriever.invoke(q)
        
        if not docs:
            return ("No client docs found.", [], 0)
            
        # --- NEW: Group Chunks by Filename ---
        # Instead of a flat list, we group content: {"invoice.pdf": ["text1", "text2"]}
        grouped_docs = defaultdict(list)
        sources_set = set()

        for d in docs:
            source = d.metadata.get('source', 'Unknown File')
            grouped_docs[source].append(d.page_content)
            sources_set.add(source)

        # Build the String Context
        context_parts = []
        for filename, chunks in grouped_docs.items():
            # Join all chunks for this specific file
            combined_text = "\n...\n".join(chunks)
            context_parts.append(f"=== DOCUMENT: {filename} ===\n{combined_text}\n=== END OF {filename} ===")

        context_str = "\n\n".join(context_parts)
        unique_sources = list(sources_set)
        
        return context_str, unique_sources, len(unique_sources)

    # Execute Search
    client_context, actual_sources, doc_count = search_client_docs(query)

    # Prompt: We explicitly tell the AI the count
    system_msg = f"""You are 'Jolly', a smart and helpful Virtual Senior Accountant. 🧑‍💼
    
    CONTEXT:
    - You have retrieved partial content from **{doc_count} unique files**.
    - The content below groups the text chunks by their parent filename.

    YOUR SOURCES:
    - **CLIENT DOCS:** The user's uploaded files (Provided in context).
    - **KNOWLEDGE:** Use your own internal training on Accounting Standards.

    INSTRUCTIONS:
    - Answer based strictly on the **CLIENT DOCS** for facts.
    - If the user asks "How many files?", use the count provided above ({doc_count}).
    - **Sources:** When you find data, mention the document filename naturally.

    Example Interaction:
    User: "Summarize my files."
    You: "I found **{doc_count} documents**:
    1. **Invoice #101** (TechCorp)
    2. **Bank Statement** (Nov 2024)..."
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_msg),
        ("human", f"CLIENT DOCS:\n{client_context}\n\nUSER QUESTION: {query}"),
    ])

    chain = prompt | llm | StrOutputParser()
    
    try:
        final_answer = chain.invoke({})
        db_service.log_chat(workflow_id, query, str(final_answer))
        return {
            "response": final_answer, 
            "sources": actual_sources 
        }
    except Exception as e:
        return {"response": f"❌ Error: {str(e)}", "sources": []}


# --- 2. EXPENSE INTELLIGENCE (Internal Knowledge) ---
def analyze_expense_intelligence(workflow_id: str):
    print(f"🕵️‍♀️ Running Expense Intelligence for {workflow_id}")
    
    # Fetch Client Data
    retriever = vector_db_service.vector_store.as_retriever(
        search_kwargs={"k": 25, "namespace": workflow_id}
    )
    client_docs = retriever.invoke("Expenses, Ledger, Invoices, Payments, Description, Amount")
    client_text = "\n".join([d.page_content for d in client_docs])

    system_prompt = """
    You are an Expert Tax Auditor performing 'Expense Intelligence'.
    
    TASK: Review the Client Transactions.
    
    USE YOUR INTERNAL KNOWLEDGE to classify items based on standard accounting principles:
    1. **Allowable:** Standard business costs (Rent, Staff costs, Utilities).
    2. **Disallowable:** Personal expenses, Fines, Non-business entertainment.
    3. **Capital:** Large asset purchases (Laptops, Machinery) -> Should be capitalized.
    4. **Suspicious:** Round numbers, weekend dates, unknown vendors.

    OUTPUT: A JSON List of objects (No markdown).
    [
      {{
        "date": "YYYY-MM-DD",
        "description": "...",
        "amount": 100.00,
        "category": "Travel",
        "verdict": "Allowable" OR "Disallowable" OR "Capital Asset" OR "Review Needed",
        "risk_flag": "🔴" (High) OR "🟡" (Medium) OR "🟢" (Safe),
        "reasoning": "Brief explanation based on general tax principles."
      }}
    ]
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"CLIENT TRANSACTIONS:\n{client_text}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        raw_json = chain.invoke({}).replace("```json", "").replace("```", "").strip()
        return json.loads(raw_json)
    except Exception as e:
        return [{"error": f"Analysis failed: {str(e)}"}]


# --- 3. YEAR-END REVIEW (Internal Knowledge) ---
def perform_year_end_review(workflow_id: str):
    print(f"📅 Starting Year-End Review for {workflow_id}")

    # Fetch Client Summary Data
    retriever = vector_db_service.vector_store.as_retriever(
        search_kwargs={"k": 30, "namespace": workflow_id}
    )
    docs = retriever.invoke("Summary, Total, Balance Sheet, Assets, Liabilities, Loan, High Value, Invoices")
    client_context = "\n".join([d.page_content for d in docs])

    system_prompt = """
    Act as a Senior Auditor performing a 'Year-End Review'.
    
    Use your **INTERNAL AUDIT KNOWLEDGE** to check the client's health.

    OBJECTIVES:
    1. **Completeness:** Are large payments (> $1000) supported by invoices?
    2. **Tax Compliance:** Flag obvious issues (e.g., personal cars expensed as business).
    3. **Cut-off:** Check for expenses that might belong to the next financial year.

    OUTPUT: A JSON Object.
    {{
      "completeness_score": "85/100",
      "compliance_notes": "General notes on the accounts...",
      "missing_documents": [
         {{ "item": "Transaction Name", "amount": 5000, "issue": "Large outflow no invoice" }}
      ],
      "working_papers": {{
         "fixed_assets_additions": ["List of new assets found..."],
         "potential_accruals": ["Expenses likely incurred but not paid..."]
      }},
      "auditor_summary": "Professional summary of the year-end health."
    }}
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", f"FINANCIAL RECORDS:\n{client_context}")
    ])
    
    chain = prompt | llm | StrOutputParser()

    try:
        raw_json = chain.invoke({}).replace("```json", "").replace("```", "").strip()
        return json.loads(raw_json)
    except Exception as e:
        return {"error": f"Year-end review failed: {str(e)}"}


# --- 4. BI-DIRECTIONAL RECONCILIATION ---
def perform_reconciliation(workflow_id: str):
    """
    Heavy-Duty Reconciliation: Fetches ALL docs (Ledgers + Invoices) 
    and performs a full context audit.
    """
    print(f"⚖️ Full-Context Reconciliation Started | User: {workflow_id}")
    
    # 1. FETCH EVERYTHING (No Vector Search)
    raw_docs = db_service.get_all_workflow_docs(workflow_id)
    
    if not raw_docs:
        return {"response": [], "sources": ["System: No documents found."]}

    # 2. Context Assembly
    combined_context = ""
    source_list = []
    
    for doc in raw_docs:
        fname = doc['filename']
        text = doc['content']
        source_list.append(fname)
        
        # Add visual separators for the AI
        combined_context += f"\n\n=== FILE START: {fname} ===\n{text}\n=== FILE END: {fname} ===\n"

    # 3. Safety Check
    if len(combined_context) > 500000:
        return {"response": [{"error": "Total document size exceeds AI limits. Please process in smaller batches."}]}

    # 4. The "Big Brain" Prompt - FIXED ESCAPING
    reconcile_prompt = """
    You are a Lead Auditor performing a comprehensive reconciliation.
    
    INPUT DATA:
    You have been provided with multiple files. 
    - One is likely a **Master Ledger** (Bank Statement/Excel).
    - The others are **Supporting Documents** (Invoices/Receipts).

    YOUR TASK:
    1. **Identify the Ledger** based on its structure (many rows, dates, balances).
    2. **Cross-Reference:** - Check every "Debit/Withdrawal" in the Ledger. Does a matching Invoice file exist?
       - Check every Invoice file. Is it recorded in the Ledger?
    
    OUTPUT:
    Return a JSON List of ONLY the discrepancies.
    [
      {{
        "date": "YYYY-MM-DD",
        "amount": 120.50,
        "description": "Uber Trip",
        "issue": "MISSING PROOF ⚠️" OR "UNRECORDED ❌" ,
        "notes": "Found on Ledger Page 4, Row 12."
      }}
    ]
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", reconcile_prompt),
        ("human", f"ALL WORKFLOW DOCUMENTS:\n{combined_context}")
    ])
    
    # Increase max_tokens for the response because a 100-page audit might have many errors
    chain = prompt | llm | StrOutputParser()
    
    try:
        raw_result = chain.invoke({})
        clean_json = raw_result.replace("```json", "").replace("```", "").strip()
        final_result = json.loads(clean_json)
        
        # Log results
        db_service.log_chat(workflow_id, "Full-Context Reconciliation", json.dumps(final_result))
        
    except Exception as e:
        final_result = [{"error": "Reconciliation failed.", "details": str(e)}]

    return {"response": final_result, "sources": source_list}
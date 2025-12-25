import json
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from src.core.config import settings
from src.services.database import db_service
from src.services.neo4j_graph import neo4j_graph_service
from src.services.vector_db import vector_db_service
from src.models.graph import GraphResponse, Node, Edge, NodeData, EdgeStyle

class GraphExtractor:
    """Extracts graph structure from documents using LLM"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name="gpt-4o",
            temperature=0,
            api_key=settings.OPENAI_API_KEY,
            model_kwargs={"response_format": {"type": "json_object"}} 
        )
    
    async def extract_graph(self, workflow_id: str) -> GraphResponse:
        # 1. Check Cache from Neo4j (SMART CHECK)
        cached_graph = neo4j_graph_service.get_saved_graph(workflow_id)
        
        # FIX: Only return cache if it has REAL data (more than just the 1 default user node)
        if cached_graph:
            node_count = len(cached_graph.get("nodes", []))
            edge_count = len(cached_graph.get("edges", []))
            
            if node_count > 1 or edge_count > 0:
                print(f"🕸️ Returning Cached Graph from Neo4j for {workflow_id} ({node_count} nodes)")
                return GraphResponse(**cached_graph)
            else:
                print(f"♻️ Cached graph is empty. Regenerating for {workflow_id}...")
        
        # 2. Fetch Document Text
        # TRY A: Fast DB Fetch (still from Supabase)
        raw_docs = db_service.get_all_workflow_docs(workflow_id)
        combined_text = ""
        
        if raw_docs:
            print("✅ Graph Builder: Using Full Text from Supabase")
            combined_text = "\n\n".join([f"--- FILE: {d['filename']} ---\n{d['content']}" for d in raw_docs])
        else:
            # TRY B: Pinecone Fallback
            print("⚠️ Graph Builder: DB empty, falling back to Pinecone...")
            retriever = vector_db_service.vector_store.as_retriever(
                search_kwargs={"k": 50, "namespace": workflow_id} 
            )
            docs = retriever.invoke("Invoice Bank Statement Date Amount Vendor")
            
            if not docs:
                print("❌ No documents found in Pinecone either.")
                return self._create_default_graph()
                
            combined_text = "\n\n".join([f"--- FRAGMENT: {d.metadata.get('source', 'Unknown')} ---\n{d.page_content}" for d in docs])

        # 3. LLM Extraction
        print(f"🕸️ Generating New Graph for {workflow_id}...")
        extracted_data = await self._llm_extract_entities(combined_text)
        
        # 4. Build Structure
        graph = self._build_graph(extracted_data)
        
        # 5. Save to Neo4j
        try:
            graph_dict = graph.model_dump()
            neo4j_graph_service.save_graph(workflow_id, graph_dict)
            print("💾 Graph saved to Neo4j.")
        except Exception as e:
            print(f"⚠️ Could not save graph to Neo4j: {e}")
        
        return graph
    
    async def _llm_extract_entities(self, text_content: str) -> Dict[str, Any]:
        """
        Uses GPT-4o to extract invoice-specific entities and relationships.
        """
        # DOUBLE CURLY BRACES ESCAPED to prevent LangChain error
        system_prompt = """You are an expert Financial Document Analyst specializing in bank statement and invoice processing.

TASK: Analyze the uploaded financial documents (bank statements, invoices) and extract a comprehensive knowledge graph showing entity relationships and transaction flows.

ENTITIES TO EXTRACT:
1. **person** - Account holder or customer (id format: person_XXX)
   - Extract: name, account number if visible
2. **transaction** - Individual bank transactions (id format: txn_XXX)
   - Include the transaction type in the name (e.g., "Amazon Purchase", "Direct Deposit", "ATM Withdrawal")
   - Extract: amount, date, description, category
   - Category MUST be one of: payment, deposit, withdrawal, transfer
3. **vendor** - Companies/merchants receiving payments (id format: vendor_XXX)
   - Extract: company name
4. **invoice** - Invoice documents if present (id format: inv_XXX)
   - Extract: invoice number, amount, date

RELATIONSHIPS TO IDENTIFY (use these EXACT types):
- **PAYMENT**: Person → Transaction (money going OUT - purchases, bills, payments)
- **DEPOSIT**: Transaction → Person (money coming IN - salary, refunds, deposits)
- **WITHDRAWAL**: Person → Transaction (ATM/cash withdrawals)
- **TRANSFER**: Person → Transaction (transfers between accounts)
- **PAID_TO**: Transaction → Vendor (who received the payment)
- **ISSUED_BY**: Invoice → Vendor (who created the invoice)
- **PAYS_FOR**: Transaction → Invoice (payment matched to invoice)

IMPORTANT RULES:
- Create a central person node for the account holder
- Each line in a bank statement = one transaction entity
- Categorize each transaction correctly (payment/deposit/withdrawal/transfer)
- Connect transactions to the person AND to vendors where applicable

Return a JSON object with this EXACT structure:
{{
  "entities": [
    {{"id": "person_john", "type": "person", "name": "John Doe", "data": {{"account": "XXXX4101"}}}},
    {{"id": "txn_001", "type": "transaction", "name": "Amazon Purchase", "data": {{"amount": 170.00, "date": "2024-09-06", "category": "payment"}}}},
    {{"id": "txn_002", "type": "transaction", "name": "Direct Deposit", "data": {{"amount": 3033.33, "date": "2024-09-14", "category": "deposit"}}}},
    {{"id": "vendor_amazon", "type": "vendor", "name": "Amazon", "data": {{}}}}
  ],
  "relationships": [
    {{"source": "person_john", "target": "txn_001", "type": "PAYMENT", "status": "valid"}},
    {{"source": "txn_002", "target": "person_john", "type": "DEPOSIT", "status": "valid"}},
    {{"source": "txn_001", "target": "vendor_amazon", "type": "PAID_TO", "status": "valid"}}
  ]
}}
"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", f"DOCUMENTS:\n{text_content}")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        try:
            res = await chain.ainvoke({})
            return json.loads(res)
        except Exception as e:
            print(f"❌ Graph LLM Error: {e}")
            return {"entities": [], "relationships": []}
    
    def _build_graph(self, extracted_data: Dict[str, Any]) -> GraphResponse:
        nodes = []
        edges = []
        
        # 1. Add Center Node
        nodes.append(Node(id="user_center", type="person", label="Client (You)", data=NodeData(role="owner")))
        
        # 2. Process Entities
        for entity in extracted_data.get("entities", []):
            label = entity.get("name", "Unknown")
            entity_type = entity.get("type", "unknown")
            
            # Add amount to label if present
            if entity.get("data", {}).get("amount"):
                label += f" (${entity['data']['amount']:,.2f})"

            nodes.append(Node(
                id=entity.get("id"),
                type=entity_type,
                label=label,
                data=NodeData(**entity.get("data", {}))
            ))
            
        # 3. Process Relationships with Invoice-Specific Styling
        for rel in extracted_data.get("relationships", []):
            rel_type = rel.get("type", "")
            status = rel.get("status", "valid")
            
            # Default: Grey
            style = EdgeStyle(stroke="#b1b1b7", strokeWidth=1)
            
            # PAYMENT: Red (money going out)
            if rel_type == "PAYMENT":
                style = EdgeStyle(stroke="#ef4444", strokeWidth=2)
            
            # DEPOSIT: Green (money coming in)
            elif rel_type == "DEPOSIT":
                style = EdgeStyle(stroke="#10b981", strokeWidth=2)
            
            # WITHDRAWAL: Orange (cash out)
            elif rel_type == "WITHDRAWAL":
                style = EdgeStyle(stroke="#f97316", strokeWidth=2)
            
            # TRANSFER: Purple (between accounts)
            elif rel_type == "TRANSFER":
                style = EdgeStyle(stroke="#8b5cf6", strokeWidth=2)
            
            # PAID_TO: Light red/coral (vendor payment link)
            elif rel_type == "PAID_TO":
                style = EdgeStyle(stroke="#fb7185", strokeWidth=1, strokeDasharray="3,3")
            
            # Invoice relationships: Blue
            elif rel_type in ["ISSUED_BY", "PAYS_FOR"]:
                style = EdgeStyle(stroke="#3b82f6", strokeWidth=2)
            
            # Missing/Error: Red dashed
            elif status == "missing" or rel_type == "MISSING_PROOF":
                style = EdgeStyle(stroke="#ef4444", strokeWidth=2, strokeDasharray="5,5")
            
            edges.append(Edge(
                source=rel.get("source"),
                target=rel.get("target"),
                label=rel_type,
                style=style
            ))
            
        return GraphResponse(nodes=nodes, edges=edges)

    def _create_default_graph(self) -> GraphResponse:
        return GraphResponse(nodes=[Node(id="user_center", type="person", label="Client (You)", data=NodeData(role="owner"))], edges=[])
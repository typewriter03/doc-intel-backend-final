import json
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from src.core.config import settings
from src.services.database import db_service
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
        # 1. Check Cache (SMART CHECK)
        cached_graph = db_service.get_saved_graph(workflow_id)
        
        # FIX: Only return cache if it has REAL data (more than just the 1 default user node)
        if cached_graph:
            node_count = len(cached_graph.get("nodes", []))
            edge_count = len(cached_graph.get("edges", []))
            
            if node_count > 1 or edge_count > 0:
                print(f"🕸️ Returning Cached Graph for {workflow_id} ({node_count} nodes)")
                return GraphResponse(**cached_graph)
            else:
                print(f"♻️ Cached graph is empty. Regenerating for {workflow_id}...")
        
        # 2. Fetch Document Text
        # TRY A: Fast DB Fetch
        raw_docs = db_service.get_all_workflow_docs(workflow_id)
        combined_text = ""
        
        if raw_docs:
            print("✅ Graph Builder: Using Full Text from DB")
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
        
        # 5. Save to Postgres
        try:
            graph_dict = graph.model_dump()
            db_service.save_graph(workflow_id, graph_dict)
            print("💾 Graph saved to DB.")
        except Exception as e:
            print(f"⚠️ Could not save graph: {e}")
        
        return graph
    
    async def _llm_extract_entities(self, text_content: str) -> Dict[str, Any]:
        """
        Uses GPT-4o to extract entities. 
        """
        # DOUBLE CURLY BRACES ESCAPED to prevent LangChain error
        system_prompt = """You are an expert Audit Graph Builder.
        
        TASK: Analyze the documents and extract a JSON knowledge graph.
        
        Identify:
        1. **Entities**: People, Companies (Vendors/Clients), Documents (Invoices/Statements).
        2. **Relationships**: ISSUED_BY, PAID_TO, MATCHES_TRANSACTION, MISSING_PROOF.
        
        Return a JSON object with this EXACT structure:
        {{
          "entities": [
            {{"id": "inv_1", "type": "document", "name": "Invoice #101", "data": {{"amount": 500, "status": "unpaid"}}}}
          ],
          "relationships": [
            {{"source": "inv_1", "target": "vendor_A", "type": "ISSUED_BY", "status": "valid"}}
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
            if entity.get("data", {}).get("amount"):
                label += f" (${entity['data']['amount']})"

            nodes.append(Node(
                id=entity.get("id"),
                type=entity.get("type", "unknown"),
                label=label,
                data=NodeData(**entity.get("data", {}))
            ))
            
        # 3. Process Relationships
        for rel in extracted_data.get("relationships", []):
            style = EdgeStyle(stroke="#b1b1b7", strokeWidth=1) # Default Grey
            
            if rel.get("type") == "MATCHES_TRANSACTION":
                style = EdgeStyle(stroke="#10b981", strokeWidth=2) # Green
            elif rel.get("status") == "missing" or rel.get("type") == "MISSING_PROOF":
                style = EdgeStyle(stroke="#ef4444", strokeWidth=2, strokeDasharray="5,5") # Red Dotted
            
            edges.append(Edge(
                source=rel.get("source"),
                target=rel.get("target"),
                label=rel.get("type"),
                style=style
            ))
            
        return GraphResponse(nodes=nodes, edges=edges)

    def _create_default_graph(self) -> GraphResponse:
        return GraphResponse(nodes=[Node(id="user_center", type="person", label="Client (You)", data=NodeData(role="owner"))], edges=[])
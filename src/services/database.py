from supabase import create_client, Client
from src.core.config import settings
from datetime import datetime

class SupabaseService:
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            print("⚠️ Supabase credentials missing!")
            self.supabase = None
            return
            
        self.supabase: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_KEY
        )
        print("✅ Connected to Supabase.")
        
    def create_workflow(self, workflow_id: str, user_id: str, name: str):
        """Creates a new persistent workspace for the user."""
        if not self.supabase: return
        
        data = {
            "id": workflow_id,
            "user_id": user_id, 
            "name": name,
            "status": "active",
            "created_at": datetime.utcnow().isoformat()
        }
        # Using upsert to be safe
        self.supabase.table("workflows").upsert(data).execute()
        
    def get_user_workflows(self, user_id: str):
        """Fetches history for the sidebar."""
        if not self.supabase: return []
        
        response = self.supabase.table("workflows")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        workflows = response.data
        
        # Enrich with Doc Counts
        # (Inefficient N+1 query but safe without guaranteed FKs)
        for wf in workflows:
            try:
                count_res = self.supabase.table("document_contents")\
                    .select("id", count="exact")\
                    .eq("workflow_id", wf['id'])\
                    .execute()
                wf['docs'] = count_res.count
            except:
                wf['docs'] = 0
                
        return workflows

    def verify_ownership(self, workflow_id: str, user_id: str) -> bool:
        """
        Security Check: Ensures User X can't access User Y's audit.
        Returns True if the workflow belongs to the user.
        """
        if not self.supabase: return False # Fail safe
        
        response = self.supabase.table("workflows")\
            .select("id")\
            .eq("id", workflow_id)\
            .eq("user_id", user_id)\
            .execute()
        
        # If we found a record, they own it
        return len(response.data) > 0

    def log_chat(self, workflow_id: str, user_q: str, bot_a: str):
        if not self.supabase: return
        
        data = {
            "workflow_id": workflow_id,
            "user_query": user_q,
            "bot_response": bot_a,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.supabase.table("chat_history").insert(data).execute()
    
    def save_document_content(self, workflow_id: str, filename: str, content: str):
        """Saves full text during ingestion."""
        data = {"workflow_id": workflow_id, "filename": filename, "content": content}
        self.supabase.table("document_contents").insert(data).execute()

    def get_all_workflow_docs(self, workflow_id: str):
        """
        Fetches ALL full-text documents for this workflow.
        Returns: List of dicts [{'filename': '...', 'content': '...'}]
        """
        response = self.supabase.table("document_contents")\
            .select("filename, content")\
            .eq("workflow_id", workflow_id)\
            .execute()
        return response.data

    def save_graph(self, workflow_id: str, graph_data: dict):
        """Saves the generated graph JSON to Supabase."""
        data = {
            "workflow_id": workflow_id,
            "graph_data": graph_data,
            # If you want to overwrite previous graphs for this workflow
        }
        # We assume a table 'workflow_graphs' exists (I will give SQL below)
        self.supabase.table("workflow_graphs").upsert(data, on_conflict="workflow_id").execute()

    def get_saved_graph(self, workflow_id: str):
        """Fetches an existing graph if it exists."""
        res = self.supabase.table("workflow_graphs")\
            .select("graph_data")\
            .eq("workflow_id", workflow_id)\
            .execute()
        return res.data[0]["graph_data"] if res.data else None
db_service = SupabaseService()
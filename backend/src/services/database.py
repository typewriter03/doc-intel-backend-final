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

    def get_chat_history(self, workflow_id: str):
        """Fetches chat history for a specific workflow."""
        if not self.supabase: return []
        
        response = self.supabase.table("chat_history")\
            .select("*")\
            .eq("workflow_id", workflow_id)\
            .order("timestamp", desc=False)\
            .execute()
        
        return response.data
    
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

    def delete_workflow(self, workflow_id: str, user_id: str) -> bool:
        """Deletes a workflow and implicitly its related data if cascade is on."""
        if not self.supabase: return False
        
        # Verify ownership first (redundant but safe)
        if not self.verify_ownership(workflow_id, user_id):
            return False

        # Delete the workflow
        self.supabase.table("workflows")\
            .delete()\
            .eq("id", workflow_id)\
            .eq("user_id", user_id)\
            .execute()
            
        return True

    def get_user_analytics(self, user_id: str, days: int = 7):
        """
        Aggregates dashboard data:
        - Document uploads per day (last N days)
        - File type distribution
        - Chat activity volume
        """
        if not self.supabase: return {}

        from datetime import datetime, timedelta
        from collections import defaultdict

        # 1. Get user workflows
        wfs = self.supabase.table("workflows")\
            .select("id")\
            .eq("user_id", user_id)\
            .execute()
        
        wf_ids = [w['id'] for w in wfs.data]
        if not wf_ids:
            return {
                "document_timeline": [0] * days,
                "file_types": {},
                "total_docs": 0
            }

        # 2. Get document activity
        # Fetching created_at and filename for all docs in user's workflows
        docs_res = self.supabase.table("document_contents")\
            .select("created_at, filename")\
            .in_("workflow_id", wf_ids)\
            .execute()
        
        docs = docs_res.data
        
        # Calculate Timeline
        cutoff = datetime.utcnow() - timedelta(days=days)
        timeline = defaultdict(int)
        file_types = defaultdict(int)

        for doc in docs:
            # Stats for file types
            ext = doc['filename'].split('.')[-1].lower() if '.' in doc['filename'] else 'other'
            file_types[ext] += 1

            # Stats for timeline
            created_at = datetime.fromisoformat(doc['created_at'].replace('Z', '+00:00'))
            if created_at.replace(tzinfo=None) > cutoff:
                date_str = created_at.strftime('%Y-%m-%d')
                timeline[date_str] += 1

        # Format timeline for frontend (last N days, chronological)
        formatted_timeline = []
        for i in range(days - 1, -1, -1):
            d = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
            formatted_timeline.append({
                "date": d,
                "count": timeline.get(d, 0)
            })

        return {
            "document_timeline": formatted_timeline,
            "file_types": dict(file_types),
            "total_docs": len(docs)
        }

db_service = SupabaseService()
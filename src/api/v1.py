import uuid
from typing import List, Dict, Any, Union
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from pydantic import BaseModel

from src.services.database import db_service
from src.core.auth import get_current_user  # The new security dependency
from src.workflows.ingest import process_and_index_document
from src.workflows.chat import retrieve_and_chat, perform_reconciliation

router = APIRouter(prefix="/v1", tags=["Workflows"])

# --- Request Models ---
class CreateWorkflowRequest(BaseModel):
    name: str = "New Audit"

class ChatRequest(BaseModel):
    workflow_id: str
    query: str
    output_format: str = "text"

class ReconcileRequest(BaseModel):
    workflow_id: str

class ChatResponse(BaseModel):
    response: Union[str, Dict[str, Any], List[Any]]
    sources: list[str] = []

class WorkflowItem(BaseModel):
    id: str
    name: str
    created_at: Union[str, None]
    status: Union[str, None]

# --- Endpoints ---

@router.post("/workflow/create")
async def create_workflow(
    req: CreateWorkflowRequest, 
    user_id: str = Depends(get_current_user)  # <--- SECURED
):
    """
    Creates a new persistent workspace linked to the logged-in user.
    """
    new_id = str(uuid.uuid4())
    try:
        db_service.create_workflow(
            workflow_id=new_id, 
            user_id=user_id, 
            name=req.name
        )
        return {"workflow_id": new_id, "name": req.name, "message": "Audit Workspace created."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workflow/list", response_model=List[WorkflowItem])
async def list_workflows(user_id: str = Depends(get_current_user)):  # <--- SECURED
    """
    Fetches the 'History' list for the current user.
    """
    try:
        workflows = db_service.get_user_workflows(user_id)
        return workflows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest(
    workflow_id: str = Form(...),
    files: List[UploadFile] = File(...),
    user_id: str = Depends(get_current_user)  # <--- SECURED
):
    # 1. Security Check
    if not db_service.verify_ownership(workflow_id, user_id):
        raise HTTPException(status_code=403, detail="Access Denied: You do not own this workflow.")

    results = []
    print(f"📥 Batch Ingest for User {user_id} -> Workflow {workflow_id}")
    
    for file in files:
        try:
            content = await file.read()
            num_chunks = process_and_index_document(workflow_id, content, file.filename)
            results.append({"filename": file.filename, "status": "success", "chunks": num_chunks})
        except Exception as e:
            results.append({"filename": file.filename, "status": "failed", "error": str(e)})
            
    return {"workflow_id": workflow_id, "processed_files": len(results), "details": results}

@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest, 
    user_id: str = Depends(get_current_user)  # <--- SECURED
):
    # 1. Security Check
    if not db_service.verify_ownership(req.workflow_id, user_id):
        raise HTTPException(status_code=403, detail="Access Denied: You do not own this workflow.")

    # 2. Proceed to Logic
    return retrieve_and_chat(req.workflow_id, req.query, req.output_format)

@router.post("/reconcile", response_model=ChatResponse)
async def reconcile_endpoint(
    req: ReconcileRequest,
    user_id: str = Depends(get_current_user)  # <--- SECURED
):
    # 1. Security Check
    if not db_service.verify_ownership(req.workflow_id, user_id):
        raise HTTPException(status_code=403, detail="Access Denied: You do not own this workflow.")

    # 2. Proceed to Logic
    return perform_reconciliation(req.workflow_id)

@router.post("/audit/expenses")
async def audit_expenses(
    req: ReconcileRequest, # Re-using this as it just needs workflow_id
    user_id: str = Depends(get_current_user)
):
    """
    Generates an 'Expense Intelligence' Report.
    Classifies allowable vs disallowable expenses & flags risks.
    """
    if not db_service.verify_ownership(req.workflow_id, user_id):
        raise HTTPException(status_code=403, detail="Access Denied")

    report = analyze_expense_intelligence(req.workflow_id)
    return {"status": "success", "report": report}

@router.post("/audit/year-end")
async def audit_year_end(
    req: ReconcileRequest, 
    user_id: str = Depends(get_current_user)
):
    """
    Performs a 'Year-End Review'.
    Checks completeness, generates working papers and schedules.
    """
    if not db_service.verify_ownership(req.workflow_id, user_id):
        raise HTTPException(status_code=403, detail="Access Denied")

    report = perform_year_end_review(req.workflow_id)
    return {"status": "success", "report": report}
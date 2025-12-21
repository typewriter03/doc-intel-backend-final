from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class NodeData(BaseModel):
    """Additional data for a node"""
    model_config = ConfigDict(extra="allow")  # Allow dynamic fields
    
    role: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    document_type: Optional[str] = None

class Node(BaseModel):
    """Graph node representing an entity or document"""
    id: str
    type: str  # "person", "document", "company", "bank_account"
    label: str
    data: Optional[NodeData] = None

class EdgeStyle(BaseModel):
    """Styling for graph edges (Frontend Visuals)"""
    stroke: Optional[str] = None
    strokeWidth: Optional[int] = None
    strokeDasharray: Optional[str] = None

class Edge(BaseModel):
    """Graph edge representing a relationship"""
    source: str
    target: str
    label: str  # "ISSUED_BY", "PAID_TO", "MATCHES_TRANSACTION"
    style: Optional[EdgeStyle] = None

class GraphResponse(BaseModel):
    """Complete graph response"""
    nodes: List[Node]
    edges: List[Edge]
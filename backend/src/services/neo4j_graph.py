from neo4j import GraphDatabase
from src.core.config import settings
from typing import Dict, Any, Optional, List


class Neo4jGraphService:
    """
    Neo4j service specifically for storing and retrieving knowledge graphs.
    This replaces the Supabase graph storage while keeping other data in Supabase.
    """
    
    def __init__(self):
        self.driver = None
        
        if not settings.NEO4J_URI or not settings.NEO4J_PASSWORD:
            print("⚠️ Neo4j credentials missing! Graph storage will use fallback.")
            return
            
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                connection_timeout=10,  # 10 second timeout
                max_connection_lifetime=300
            )
            # Verify connection with timeout
            self.driver.verify_connectivity()
            print("✅ Connected to Neo4j Aura.")
        except Exception as e:
            print(f"⚠️ Neo4j connection failed (will use fallback): {e}")
            self.driver = None
    
    def close(self):
        """Close the Neo4j driver connection."""
        if self.driver:
            self.driver.close()
    
    def save_graph(self, workflow_id: str, graph_data: Dict[str, Any]) -> bool:
        """
        Saves the knowledge graph to Neo4j.
        - Clears existing graph for this workflow
        - Creates nodes with labels based on type
        - Creates relationships between nodes
        """
        if not self.driver:
            print("⚠️ Neo4j not connected. Cannot save graph.")
            return False
        
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])
        
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                # 1. Clear existing graph for this workflow
                session.run("""
                    MATCH (n {workflow_id: $workflow_id})
                    DETACH DELETE n
                """, workflow_id=workflow_id)
                
                # 2. Create nodes
                for node in nodes:
                    node_type = node.get("type", "Entity").capitalize()
                    node_id = node.get("id", "")
                    label = node.get("label", "")
                    data = node.get("data", {})
                    
                    # Build properties dict
                    props = {
                        "node_id": node_id,
                        "workflow_id": workflow_id,
                        "label": label,
                        "node_type": node.get("type", "unknown"),
                        **{k: v for k, v in (data or {}).items() if v is not None}
                    }
                    
                    # Create node with dynamic label
                    session.run(f"""
                        CREATE (n:{node_type} $props)
                    """, props=props)
                
                # 3. Create relationships
                for edge in edges:
                    source = edge.get("source", "")
                    target = edge.get("target", "")
                    rel_type = edge.get("label", "RELATED_TO").replace(" ", "_").upper()
                    style = edge.get("style", {})
                    
                    # Store style as relationship properties
                    rel_props = {
                        "stroke": style.get("stroke") if style else None,
                        "strokeWidth": style.get("strokeWidth") if style else None,
                        "strokeDasharray": style.get("strokeDasharray") if style else None
                    }
                    # Filter out None values
                    rel_props = {k: v for k, v in rel_props.items() if v is not None}
                    
                    session.run(f"""
                        MATCH (a {{workflow_id: $workflow_id, node_id: $source}})
                        MATCH (b {{workflow_id: $workflow_id, node_id: $target}})
                        CREATE (a)-[r:{rel_type} $props]->(b)
                    """, workflow_id=workflow_id, source=source, target=target, props=rel_props)
                
                print(f"💾 Graph saved to Neo4j: {len(nodes)} nodes, {len(edges)} edges")
                return True
                
        except Exception as e:
            print(f"❌ Neo4j save error: {e}")
            return False
    
    def get_saved_graph(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the knowledge graph from Neo4j for a given workflow.
        Returns the graph in the same format as the input (nodes + edges).
        """
        if not self.driver:
            return None
        
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                # 1. Get all nodes
                nodes_result = session.run("""
                    MATCH (n {workflow_id: $workflow_id})
                    RETURN n.node_id as id, n.node_type as type, n.label as label,
                           properties(n) as data
                """, workflow_id=workflow_id)
                
                nodes = []
                for record in nodes_result:
                    data = dict(record["data"])
                    # Remove internal properties from data
                    for key in ["workflow_id", "node_id", "label", "node_type"]:
                        data.pop(key, None)
                    
                    nodes.append({
                        "id": record["id"],
                        "type": record["type"],
                        "label": record["label"],
                        "data": data if data else None
                    })
                
                # 2. Get all relationships
                edges_result = session.run("""
                    MATCH (a {workflow_id: $workflow_id})-[r]->(b {workflow_id: $workflow_id})
                    RETURN a.node_id as source, b.node_id as target, type(r) as label,
                           properties(r) as style
                """, workflow_id=workflow_id)
                
                edges = []
                for record in edges_result:
                    edges.append({
                        "source": record["source"],
                        "target": record["target"],
                        "label": record["label"],
                        "style": record["style"] if record["style"] else None
                    })
                
                if not nodes:
                    return None
                
                print(f"🔍 Graph loaded from Neo4j: {len(nodes)} nodes, {len(edges)} edges")
                return {"nodes": nodes, "edges": edges}
                
        except Exception as e:
            print(f"❌ Neo4j fetch error: {e}")
            return None
    
    def delete_graph(self, workflow_id: str) -> bool:
        """Deletes all nodes and relationships for a workflow."""
        if not self.driver:
            return False
        
        try:
            with self.driver.session(database=settings.NEO4J_DATABASE) as session:
                session.run("""
                    MATCH (n {workflow_id: $workflow_id})
                    DETACH DELETE n
                """, workflow_id=workflow_id)
                print(f"🗑️ Graph deleted from Neo4j for workflow: {workflow_id}")
                return True
        except Exception as e:
            print(f"❌ Neo4j delete error: {e}")
            return False


# Singleton instance
neo4j_graph_service = Neo4jGraphService()

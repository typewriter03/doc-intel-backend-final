# DocIntel API Documentation

Complete API reference for the DocIntel platform.

## API Versions

### V1 API (Current - Recommended)
Modern RESTful API with workflow-based document management and AI-powered features.

**Base URL**: `http://localhost:8000/v1`

#### Core Endpoints

| Endpoint | Method | Description | Documentation |
| :--- | :--- | :--- | :--- |
| `/workflow/init` | POST | Initialize new workflow session | [📄 Docs](workflow_init_api.md) |
| `/ingest` | POST | Upload and process documents | [📄 Docs](ingest_api.md) |
| `/chat` | POST | Query documents with AI | [📄 Docs](chat_api.md) |
| `/reconcile` | POST | Auto-match transactions | [📄 Docs](reconcile_api.md) |
| `/ingest-tax` | POST | Upload tax rulebooks (global) | [📄 Docs](tax_knowledge_base_api.md) |

### Legacy API
Original endpoints for backward compatibility. Use V1 API for new integrations.

**Base URL**: `http://localhost:8000/legacy`

| Endpoint | Method | Description | Documentation |
| :--- | :--- | :--- | :--- |
| `/parse` | POST | Parse document, download ZIP | [📄 Docs](parser_api.md) |
| `/classify` | POST | Classify HTML documents | [📄 Docs](classifier_api.md) |

## Quick Start

### 1. Initialize Workflow
```bash
curl -X POST "http://localhost:8000/v1/workflow/init"
```

Response:
```json
{
  "workflow_id": "7a3f2c1e-9b4d-4e8a-a5f6-1c2d3e4f5a6b",
  "message": "Workflow initialized."
}
```

### 2. Upload Documents
```bash
curl -X POST "http://localhost:8000/v1/ingest" \
  -F "workflow_id=YOUR_WORKFLOW_ID" \
  -F "files=@invoice.pdf"
```

### 3. Chat with Documents
```bash
curl -X POST "http://localhost:8000/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "YOUR_WORKFLOW_ID",
    "query": "What is the total amount?"
  }'
```

### 4. Run Reconciliation
```bash
curl -X POST "http://localhost:8000/v1/reconcile" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "YOUR_WORKFLOW_ID"
  }'
```

## Authentication

**Current**: No authentication required  
**Future**: API key authentication planned

## Rate Limits

**Current**: No rate limits  
**Recommended**: Implement client-side throttling for production use

## Error Handling

All endpoints return standard HTTP status codes:

| Code | Meaning | Description |
| :--- | :--- | :--- |
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid API key (legacy endpoints) |
| 500 | Internal Server Error | Server-side error |

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

## SDKs & Client Libraries

### Python
```python
import requests

class DocIntelClient:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.workflow_id = None
    
    def init_workflow(self):
        response = requests.post(f"{self.base_url}/v1/workflow/init")
        self.workflow_id = response.json()['workflow_id']
        return self.workflow_id
    
    def ingest(self, file_path):
        with open(file_path, 'rb') as f:
            files = {'files': f}
            data = {'workflow_id': self.workflow_id}
            response = requests.post(
                f"{self.base_url}/v1/ingest",
                files=files,
                data=data
            )
        return response.json()
    
    def chat(self, query):
        response = requests.post(
            f"{self.base_url}/v1/chat",
            json={
                'workflow_id': self.workflow_id,
                'query': query
            }
        )
        return response.json()['response']

# Usage
client = DocIntelClient()
client.init_workflow()
client.ingest("invoice.pdf")
answer = client.chat("What is the total?")
print(answer)
```

### JavaScript
```javascript
class DocIntelClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.workflowId = null;
  }

  async initWorkflow() {
    const response = await fetch(`${this.baseUrl}/v1/workflow/init`, {
      method: 'POST'
    });
    const data = await response.json();
    this.workflowId = data.workflow_id;
    return this.workflowId;
  }

  async ingest(file) {
    const formData = new FormData();
    formData.append('workflow_id', this.workflowId);
    formData.append('files', file);

    const response = await fetch(`${this.baseUrl}/v1/ingest`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  }

  async chat(query) {
    const response = await fetch(`${this.baseUrl}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: this.workflowId,
        query: query
      })
    });
    const data = await response.json();
    return data.response;
  }
}

// Usage
const client = new DocIntelClient();
await client.initWorkflow();
await client.ingest(fileInput.files[0]);
const answer = await client.chat('What is the total?');
console.log(answer);
```

## Interactive Documentation

Access Swagger UI for interactive API testing:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Webhooks

**Status**: Not yet implemented  
**Planned**: Webhook notifications for:
- Document processing completion
- Reconciliation results
- Error notifications

## Changelog

### Version 1.0 (Current)
- Initial V1 API release
- Workflow-based document management
- AI-powered chat and reconciliation
- Tax knowledge base support

### Legacy (Deprecated)
- Original parser and classifier endpoints
- Maintained for backward compatibility
- No new features planned

## Support

- **Documentation**: This folder
- **Issues**: GitHub Issues
- **API Status**: http://localhost:8000/

## Best Practices

1. **Always initialize workflow first** before uploading documents
2. **Store workflow_id** in client-side storage for session persistence
3. **Handle errors gracefully** with try-catch blocks
4. **Batch upload** related documents together
5. **Use descriptive filenames** for better document identification
6. **Review reconciliation results** manually before taking action
7. **Upload tax rulebooks** once during setup, not per workflow

## Migration Guide

### From Legacy to V1 API

**Old (Legacy)**:
```python
# Parse document
response = requests.post(
    "http://localhost:8000/legacy/parse",
    files={"file": open("doc.pdf", "rb")},
    data={"auth_key": "SECRET"}
)
```

**New (V1)**:
```python
# Initialize workflow
workflow = requests.post("http://localhost:8000/v1/workflow/init").json()

# Ingest document
response = requests.post(
    "http://localhost:8000/v1/ingest",
    files={"files": open("doc.pdf", "rb")},
    data={"workflow_id": workflow['workflow_id']}
)

# Chat with document
answer = requests.post(
    "http://localhost:8000/v1/chat",
    json={
        "workflow_id": workflow['workflow_id'],
        "query": "Summarize this document"
    }
).json()
```

## Performance Tips

- **Parallel uploads**: Upload multiple files concurrently (within reason)
- **Chunk size**: Default 1000 chars is optimal for most use cases
- **Caching**: Workflow data is cached in Pinecone, no need to re-upload
- **Background processing**: Tax rulebook ingestion runs in background

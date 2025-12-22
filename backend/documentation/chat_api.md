# Chat API Documentation

## Endpoint: Chat with Documents
**URL**: `/v1/chat`  
**Method**: `POST`  
**Description**: 
Query your ingested documents using natural language. The AI assistant retrieves relevant context from your uploaded files and generates intelligent responses based on the content.

### Features
- Semantic search across all documents in the workflow
- Context-aware responses using GPT-4
- Access to both client documents and global tax knowledge base
- Support for text and JSON output formats

### Request Body

**Content-Type**: `application/json`

| Name | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `workflow_id` | string | Yes | - | The unique ID of the workflow session |
| `query` | string | Yes | - | Your question or prompt |
| `output_format` | string | No | `"text"` | Response format: `"text"` or `"json"` |

#### Example Request (Text Format)
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "What is the total amount in the marketing invoice?"
}
```

#### Example Request (JSON Format)
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "List all expenses with amounts",
  "output_format": "json"
}
```

### Responses

#### Success Response (200 OK)
**Content-Type**: `application/json`

**Text Format Response:**
```json
{
  "response": "The marketing invoice shows a total amount of $5,000.00 for digital advertising services.",
  "sources": ["Agent (Multi-Source)"]
}
```

**JSON Format Response:**
```json
{
  "response": [
    {
      "date": "2024-01-15",
      "description": "Marketing Agency",
      "amount": 5000.00,
      "category": "Advertising"
    },
    {
      "date": "2024-01-20",
      "description": "Office Supplies",
      "amount": 250.00,
      "category": "Supplies"
    }
  ],
  "sources": ["Agent (Multi-Source)"]
}
```

#### Error Responses
- **500 Internal Server Error**: LLM generation or retrieval failed

### Example Usage

#### Python
```python
import requests

url = "http://localhost:8000/v1/chat"
payload = {
    "workflow_id": "YOUR_WORKFLOW_ID",
    "query": "What are the tax-deductible expenses?",
    "output_format": "text"
}
response = requests.post(url, json=payload)
print(response.json())
```

#### cURL
```bash
curl -X POST "http://localhost:8000/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "YOUR_WORKFLOW_ID",
    "query": "Summarize the bank statement"
  }'
```

#### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:8000/v1/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_id: 'YOUR_WORKFLOW_ID',
    query: 'What invoices are missing?'
  })
});
const data = await response.json();
console.log(data.response);
```

### Notes
- The AI has access to both your uploaded documents and the global tax knowledge base
- Responses are generated using GPT-4 with temperature=0 for consistency
- The system automatically retrieves the 5 most relevant document chunks
- For structured data extraction, use `output_format: "json"`

# Ingest API Documentation

## Endpoint: Ingest Documents
**URL**: `/v1/ingest`  
**Method**: `POST`  
**Description**: 
Upload and process documents into your workflow. Supports batch uploads and multiple file formats. Documents are parsed, converted to markdown, chunked, and stored in the vector database for semantic search.

### Supported File Types
- **PDF** - Invoices, receipts, reports
- **DOCX/DOC** - Word documents
- **CSV/XLSX/XLS** - Spreadsheets, bank statements
- **Images** - PNG, JPG, JPEG (with OCR)
- **PPTX** - Presentations

### Processing Pipeline
1. **Parse** - Extract content using Docling
2. **Convert** - Transform to clean Markdown
3. **Chunk** - Split into 1000-character chunks with 250-char overlap
4. **Embed** - Generate vector embeddings
5. **Store** - Save to Pinecone with workflow namespace

### Request Parameters

**Content-Type**: `multipart/form-data`

| Name | Type | In | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `workflow_id` | string | form | Yes | The unique ID of the workflow session |
| `files` | file[] | form | Yes | One or more files to ingest (supports batch upload) |

### Responses

#### Success Response (200 OK)
**Content-Type**: `application/json`

**Single File:**
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000",
  "processed_files": 1,
  "details": [
    {
      "filename": "invoice_jan_2024.pdf",
      "status": "success",
      "chunks": 15
    }
  ]
}
```

**Multiple Files (Batch):**
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000",
  "processed_files": 3,
  "details": [
    {
      "filename": "bank_statement.csv",
      "status": "success",
      "chunks": 8
    },
    {
      "filename": "invoice_001.pdf",
      "status": "success",
      "chunks": 12
    },
    {
      "filename": "receipt.jpg",
      "status": "success",
      "chunks": 3
    }
  ]
}
```

#### Partial Success (200 OK)
If some files fail, the endpoint still returns 200 but marks failed files:
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000",
  "processed_files": 2,
  "details": [
    {
      "filename": "valid_file.pdf",
      "status": "success",
      "chunks": 10
    },
    {
      "filename": "corrupted_file.pdf",
      "status": "failed",
      "error": "Parser Error: Invalid PDF structure"
    }
  ]
}
```

#### Error Responses
- **500 Internal Server Error**: Complete ingestion failure

### Example Usage

#### Python (Single File)
```python
import requests

url = "http://localhost:8000/v1/ingest"
workflow_id = "YOUR_WORKFLOW_ID"

with open("invoice.pdf", "rb") as f:
    files = {"files": f}
    data = {"workflow_id": workflow_id}
    response = requests.post(url, files=files, data=data)

print(response.json())
```

#### Python (Multiple Files)
```python
import requests

url = "http://localhost:8000/v1/ingest"
workflow_id = "YOUR_WORKFLOW_ID"

files = [
    ("files", open("invoice1.pdf", "rb")),
    ("files", open("invoice2.pdf", "rb")),
    ("files", open("bank_statement.csv", "rb"))
]

data = {"workflow_id": workflow_id}
response = requests.post(url, files=files, data=data)

print(response.json())
```

#### cURL (Single File)
```bash
curl -X POST "http://localhost:8000/v1/ingest" \
  -F "workflow_id=YOUR_WORKFLOW_ID" \
  -F "files=@invoice.pdf"
```

#### cURL (Multiple Files)
```bash
curl -X POST "http://localhost:8000/v1/ingest" \
  -F "workflow_id=YOUR_WORKFLOW_ID" \
  -F "files=@invoice1.pdf" \
  -F "files=@invoice2.pdf" \
  -F "files=@statement.csv"
```

#### JavaScript (FormData)
```javascript
const formData = new FormData();
formData.append('workflow_id', 'YOUR_WORKFLOW_ID');
formData.append('files', fileInput.files[0]);

const response = await fetch('http://localhost:8000/v1/ingest', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

### Performance Notes
- Processing time varies by file size and type
- PDFs: ~2-5 seconds per page
- Images: ~3-7 seconds (includes OCR)
- CSV: ~1-2 seconds
- Batch uploads are processed sequentially
- Failed files don't stop processing of other files

### Best Practices
1. **File Naming**: Use descriptive names (e.g., `invoice_jan_2024.pdf`)
2. **Batch Upload**: Upload related documents together
3. **File Size**: Keep individual files under 50MB
4. **Format**: Use PDF for best results with complex layouts

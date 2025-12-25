# Tax Knowledge Base API Documentation

## Endpoint: Ingest Tax Rulebooks
**URL**: `/v1/ingest-tax`  
**Method**: `POST`  
**Description**: 
Upload official tax rulebooks and regulations to the global knowledge base. These documents become available to ALL workflows and are used to provide tax compliance guidance during chat interactions.

### Purpose
- Create a centralized repository of tax regulations
- Make official tax rules accessible across all user sessions
- Enable AI to provide accurate tax compliance advice
- Support cross-referencing between client documents and tax law

### Global vs Workflow Documents

| Type | Scope | Namespace | Use Case |
| :--- | :--- | :--- | :--- |
| **Workflow Documents** | Single session | `workflow_id` | Client invoices, receipts, statements |
| **Tax Knowledge Base** | All sessions | `TAX_KNOWLEDGE_BASE` | Official tax codes, regulations, guides |

### Request Parameters

**Content-Type**: `multipart/form-data`

| Name | Type | In | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | file | form | Yes | Tax rulebook PDF (e.g., IRS Publication, VAT Guide) |

**Note**: Only accepts **single file** uploads (not batch)

### Processing
- Runs in **background** (non-blocking)
- Uses same parsing pipeline as regular documents
- Stores in global `TAX_KNOWLEDGE_BASE` namespace
- Accessible immediately after processing completes

### Responses

#### Success Response (200 OK)
**Content-Type**: `application/json`

```json
{
  "status": "Tax Rulebook ingestion started",
  "namespace": "TAX_KNOWLEDGE_BASE"
}
```

**Note**: Response is immediate. Actual processing happens in background.

#### Error Responses
- **500 Internal Server Error**: Failed to initiate background task

### Example Usage

#### Python
```python
import requests

url = "http://localhost:8000/v1/ingest-tax"

with open("IRS_Publication_535.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(url, files=files)

print(response.json())
# Output: {"status": "Tax Rulebook ingestion started", "namespace": "TAX_KNOWLEDGE_BASE"}
```

#### cURL
```bash
curl -X POST "http://localhost:8000/v1/ingest-tax" \
  -F "file=@VAT_Guide_2024.pdf"
```

#### JavaScript
```javascript
const formData = new FormData();
formData.append('file', taxRulebookFile);

const response = await fetch('http://localhost:8000/v1/ingest-tax', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.status);
```

### Recommended Tax Documents

#### United States
- IRS Publication 535 (Business Expenses)
- IRS Publication 463 (Travel, Gift, and Car Expenses)
- IRS Publication 587 (Business Use of Your Home)

#### United Kingdom
- VAT Notice 700 (The VAT Guide)
- HMRC Business Income Manual
- Capital Allowances Guide

#### European Union
- EU VAT Directive
- Country-specific VAT guides

### How Tax Rules Are Used

When a user asks a tax-related question:
1. System searches **both** client documents AND tax knowledge base
2. Retrieves relevant sections from tax rulebooks
3. Cross-references client expenses against tax regulations
4. Provides compliance guidance based on official rules

#### Example Chat Query
**User**: "Is my marketing expense tax deductible?"

**AI Response**: 
> Based on IRS Publication 535, advertising and marketing expenses are generally fully deductible as ordinary and necessary business expenses. Your marketing invoice for $5,000 appears to qualify as a deductible business expense.

### Best Practices

1. **Official Sources**: Only upload official government publications
2. **Current Year**: Use the most recent version of tax guides
3. **Jurisdiction**: Upload rules relevant to your tax jurisdiction
4. **File Size**: Tax PDFs can be large (10-50MB), ensure stable connection
5. **Naming**: Use descriptive filenames (e.g., `IRS_Pub_535_2024.pdf`)

### Limitations

- **Single File**: Cannot batch upload (use `/v1/ingest` for that)
- **No Deletion**: Currently no API to remove tax documents
- **Global Scope**: All users share the same tax knowledge base
- **Background Processing**: No callback when processing completes

### Administrative Use

This endpoint is typically used by:
- System administrators setting up the platform
- Accountants configuring the knowledge base
- Compliance teams updating regulations

**Not** intended for regular end-user document uploads (use `/v1/ingest` instead).

### Future Enhancements

Planned features:
- List all tax documents in knowledge base
- Delete/update specific tax rulebooks
- Version management for tax regulations
- Jurisdiction-specific namespaces

# Reconciliation API Documentation

## Endpoint: Transaction Reconciliation
**URL**: `/v1/reconcile`  
**Method**: `POST`  
**Description**: 
Automatically match bank transactions against invoices and receipts to detect discrepancies, missing documents, and potential errors. This endpoint performs intelligent reconciliation across all documents in your workflow.

### Features
- Automatic matching of bank entries to invoices
- Detection of missing supporting documents
- Amount discrepancy identification
- Date variance tolerance (1-2 days)
- Structured JSON output for easy integration

### How It Works
1. **Retrieves** all documents from the workflow (bank statements, invoices, receipts)
2. **Analyzes** transactions using GPT-4
3. **Matches** bank outflows to corresponding invoices
4. **Flags** missing documents, unmatched entries, and errors
5. **Returns** detailed reconciliation report

### Request Body

**Content-Type**: `application/json`

| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `workflow_id` | string | Yes | The unique ID of the workflow session |

#### Example Request
```json
{
  "workflow_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Responses

#### Success Response (200 OK)
**Content-Type**: `application/json`

```json
{
  "response": [
    {
      "date": "2024-01-15",
      "description": "Marketing Agency Payment",
      "amount": 5000.00,
      "status": "Matched ✔️",
      "notes": "Found invoice matching amount and date"
    },
    {
      "date": "2024-01-20",
      "description": "Office Supplies",
      "amount": 250.00,
      "status": "Missing document ⚠️",
      "notes": "No matching invoice found for this transaction"
    },
    {
      "date": "2024-01-25",
      "description": "Software Subscription",
      "amount": 99.00,
      "status": "Potential error ❌",
      "notes": "Invoice shows $999.00 but bank entry is $99.00"
    }
  ],
  "sources": ["Auto-Reconciliation Tool"]
}
```

#### Status Types
- **Matched ✔️** - Transaction has corresponding invoice with matching amount
- **Missing document ⚠️** - Bank entry exists but no supporting invoice found
- **Potential error ❌** - Amount mismatch between bank and invoice
- **Unmatched bank entry** - Invoice exists but no corresponding bank transaction

#### Error Responses
- **500 Internal Server Error**: Reconciliation failed (insufficient data or LLM error)

### Example Usage

#### Python
```python
import requests

url = "http://localhost:8000/v1/reconcile"
payload = {
    "workflow_id": "YOUR_WORKFLOW_ID"
}
response = requests.post(url, json=payload)
result = response.json()

# Process reconciliation results
for transaction in result['response']:
    if 'Missing' in transaction['status']:
        print(f"⚠️ Missing document: {transaction['description']}")
    elif 'error' in transaction['status']:
        print(f"❌ Error: {transaction['description']} - {transaction['notes']}")
```

#### cURL
```bash
curl -X POST "http://localhost:8000/v1/reconcile" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "YOUR_WORKFLOW_ID"
  }'
```

#### JavaScript
```javascript
const response = await fetch('http://localhost:8000/v1/reconcile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow_id: 'YOUR_WORKFLOW_ID'
  })
});

const data = await response.json();
const missingDocs = data.response.filter(t => 
  t.status.includes('Missing')
);
console.log(`Found ${missingDocs.length} missing documents`);
```

### Reconciliation Rules

1. **Amount Matching**
   - Exact match preferred
   - Allows minor rounding differences (< $0.01)

2. **Date Tolerance**
   - Allows 1-2 day variance between bank date and invoice date
   - Accounts for processing delays

3. **Description Matching**
   - Uses semantic similarity, not exact text match
   - Handles variations in vendor names

4. **Multiple Matches**
   - If multiple invoices match, selects closest date
   - Flags ambiguous matches in notes

### Best Practices

1. **Upload Order**: Upload bank statements first, then invoices
2. **File Naming**: Use clear, descriptive filenames
3. **Data Quality**: Ensure bank statements and invoices have clear dates and amounts
4. **Review**: Always manually review flagged transactions
5. **Batch Processing**: Upload all documents before running reconciliation

### Use Cases

- **Monthly Bookkeeping**: Reconcile all transactions at month-end
- **Audit Preparation**: Identify missing documentation
- **Expense Verification**: Detect duplicate or erroneous payments
- **Tax Compliance**: Ensure all deductions have supporting documents

### Performance

- Processing time: ~10-30 seconds depending on document count
- Retrieves up to 15 document chunks for analysis
- Handles workflows with 50+ transactions
- Results are not cached (run on-demand)

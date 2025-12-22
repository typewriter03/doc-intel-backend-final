# Classifier API Documentation

## Endpoint: Classify Document
**URL**: `/v1/classify`
**Method**: `POST`
**Description**: 
Accepts an HTML file, runs the classifier, and returns the highest probability class for the document content.

### Parameters

| Name | Type | In | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | file | formData | Yes | The HTML file to be classified. Must end with .html or .htm. |
| `auth_key` | string | formData | Yes | Authentication key for access. |

### Responses

#### Success Response (200 OK)
**Content-Type**: `application/json`
```json
{
  "filename": "document.html",
  "classification": "Invoice"
}
```

#### Error Responses
* **400 Bad Request**: Only HTML files are supported.
* **401 Unauthorized**: Invalid authentication key.
* **500 Internal Server Error**: Classification failed or file saving error.

### Example Usage (Python)
```python
import requests

url = "http://localhost:8000/v1/classify"
file_path = "path/to/document.html"

with open(file_path, "rb") as f:
    files = {"file": f}
    data = {"auth_key": "YOUR_SECRET_KEY"}
    response = requests.post(url, files=files, data=data)

print(response.json())
```

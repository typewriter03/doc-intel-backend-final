# Parser API Documentation

## Endpoint: Parse Document
**URL**: `/v1/parse`
**Method**: `POST`
**Description**: 
Accepts a file and authentication key, runs the parser, and returns the processed HTML + assets as a ZIP archive.
The parser automatically detects the file type (PDF, DOCX, CSV, PPTX, Image) and routes it to the appropriate parsing logic.

### Parameters

| Name | Type | In | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `file` | file | formData | Yes | The file to be parsed. Supported formats: .pdf, .docx, .csv, .xlsx, .pptx, .txt, .md, .png, .jpg, etc. |
| `auth_key` | string | formData | Yes | Authentication key for access. |
| `output_path` | string | formData | No | Optional path to save results permanently instead of a temp folder. |

### Responses

#### Success Response (200 OK)
Returns a ZIP file containing the parsed output (HTML, assets, etc.).
**Content-Type**: `application/zip`

#### Error Responses
* **401 Unauthorized**: Invalid authentication key.
* **400 Bad Request**: Unsupported file format.
* **500 Internal Server Error**: Parser execution failed or file saving error.

### Example Usage (Python)
```python
import requests

url = "http://localhost:8000/v1/parse"
file_path = "path/to/document.pdf"

with open(file_path, "rb") as f:
    files = {"file": f}
    data = {
        "auth_key": "YOUR_SECRET_KEY",
        "output_path": "" 
    }
    response = requests.post(url, files=files, data=data)

if response.status_code == 200:
    with open("output.zip", "wb") as f:
        f.write(response.content)
    print("Parsing successful, saved to output.zip")
else:
    print(f"Error: {response.text}")
```

# DocIntel - Advanced Document Intelligence Platform

AI-powered document processing and tax compliance assistant with RAG capabilities.

## Features

- 🤖 **Tax Assistant** - AI-powered chat for tax regulation analysis and document verification
- 📄 **Document Ingestion** - Process PDFs, DOCX, CSV, images, and PPTX files
- 🔍 **CAT Classification** - Automatic HTML document classification
- 💼 **Transaction Reconciliation** - Match invoices against bank statements
- 🗂️ **Session Management** - Isolated workflows for different projects
- 📊 **Vector Search** - Semantic search using Pinecone and HuggingFace embeddings

## Prerequisites

- Python 3.10+
- Docker (optional)
- OpenAI API Key
- Pinecone API Key
- Supabase Account

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/SeekmeAI/py_api_doc_intel.git
cd py_api_doc_intel
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure your credentials:

```ini
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=docintel

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384

# Authentication (Legacy endpoints)
SECRET_KEY_HASH=your_sha256_hash
SECRET_SALT=your_salt
```

### 4. Model Setup (Optional)

> ⚠️ **Note**: If you're using the legacy CAT Classification feature, you need to download the model separately.

The classification model is **not included** in this repository due to size constraints. If needed:

1. Download the model files from [your model source]
2. Place them in: `src/classify_raw/model/`
3. The model directory is already in `.gitignore`

**Current classification** uses the `/legacy/classify` endpoint which requires this model.

## Running the Application

### Option 1: Local Development

#### Start Backend

```bash
uvicorn app:app --reload
```

Backend will be available at `http://localhost:8000`

#### Start Frontend

```bash
cd frontend
python -m http.server 3000
```

Frontend will be available at `http://localhost:3000`

### Option 2: Docker

Build and run using Docker:

```bash
# Build the image
docker build -t docintel .

# Run the container
docker run -p 8000:8000 --env-file .env docintel
```

For frontend with Docker:

```bash
cd frontend
docker build -t docintel-frontend .
docker run -p 3000:3000 docintel-frontend
```

## API Documentation

Once the backend is running, access interactive API docs:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main Endpoints

#### V1 API (Current)

- `POST /v1/workflow/init` - Initialize new workflow session
- `POST /v1/ingest` - Upload and process documents
- `POST /v1/chat` - Query documents with AI assistant
- `POST /v1/reconcile` - Run transaction reconciliation
- `POST /v1/ingest-tax` - Upload tax rulebooks to global knowledge base

#### Legacy API

- `POST /legacy/parse` - Parse documents and download as ZIP
- `POST /legacy/classify` - Classify HTML documents

## Project Structure

```
.
├── app.py                  # FastAPI application entry point
├── frontend/               # Web UI
│   ├── index.html
│   ├── script.js
│   └── style.css
├── src/
│   ├── api/               # API routes
│   │   ├── v1.py          # Main API endpoints
│   │   ├── parser.py      # Legacy parser endpoint
│   │   └── classifier.py  # Legacy classifier endpoint
│   ├── core/              # Core utilities
│   │   ├── config.py      # Configuration
│   │   ├── parser_*.py    # Document parsers
│   │   └── utils.py       # Helper functions
│   ├── services/          # External services
│   │   ├── database.py    # Supabase integration
│   │   └── vector_db.py   # Pinecone integration
│   └── workflows/         # Business logic
│       ├── chat.py        # Chat & reconciliation
│       └── ingest.py      # Document ingestion
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── .env.example          # Environment template
```

## Usage

### 1. Create a New Session

Click "New Session" in the sidebar to create an isolated workflow.

### 2. Upload Documents

Go to **Tax Assistant > Data Ingestion** and upload:
- Bank statements (PDF, CSV)
- Invoices (PDF, images)
- Receipts (PDF, images)

### 3. Chat with Your Documents

Ask questions like:
- "What expenses are in the bank statement?"
- "Is the marketing invoice tax deductible?"
- "Show me all transactions over $500"

### 4. Run Reconciliation

Go to **Tax Assistant > Reconciliation** to automatically match invoices against bank transactions.

## Development

### Database Setup

The application uses Supabase with the following tables:

- `workflows` - Workflow sessions
- `chat_history` - Conversation logs

Create these tables in your Supabase dashboard or use the provided schema (if available).

### Adding New Document Parsers

Add parser functions in `src/core/parser_*.py` and register them in `src/workflows/ingest.py`.

## Troubleshooting

### Common Issues

**"Pinecone connection error"**
- Verify your `PINECONE_API_KEY` is correct
- Check if the index name exists in your Pinecone dashboard

**"Supabase credentials missing"**
- Ensure `SUPABASE_URL` and `SUPABASE_KEY` are set in `.env`

**"Model not found" (Legacy classifier)**
- Download the model and place it in `src/classify_raw/model/`
- Or use the new classification features instead

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

import { auth } from '../lib/firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getHeaders = async () => {
    const user = auth.currentUser;
    const headers = {
        'Content-Type': 'application/json',
    };

    if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const api = {
    getWorkflows: async () => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/workflow/list`, {
            method: 'GET',
            headers,
        });
        if (!res.ok) throw new Error('Failed to fetch workflows');
        return res.json();
    },

    createWorkflow: async (name) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/workflow/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error('Failed to create workflow');
        return res.json();
    },

    deleteWorkflow: async (workflowId) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/workflow/${workflowId}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error('Failed to delete workflow');
        return res.json();
    },

    // --- Document Intelligence Workflows ---

    // Documents
    ingestFiles: async (workflowId, files) => {
        const headers = await getHeaders();
        // Remove Content-Type header to let browser set boundary for FormData
        delete headers['Content-Type'];

        const formData = new FormData();
        formData.append('workflow_id', workflowId);
        files.forEach(file => formData.append('files', file));

        const res = await fetch(`${API_BASE_URL}/v1/ingest`, {
            method: 'POST',
            headers: {
                'Authorization': headers['Authorization']
            },
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to ingest files');
        return res.json();
    },

    // Chat
    chat: async (workflowId, query, outputFormat = 'text') => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                workflow_id: workflowId,
                query,
                output_format: outputFormat
            }),
        });
        if (!res.ok) throw new Error('Chat request failed');
        return res.json();
    },

    // Reconciliation
    reconcile: async (workflowId) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/reconcile`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ workflow_id: workflowId }),
        });
        if (!res.ok) throw new Error('Reconciliation failed');
        return res.json();
    },

    // Audits
    auditExpenses: async (workflowId) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/audit/expenses`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ workflow_id: workflowId }),
        });
        if (!res.ok) throw new Error('Expense audit failed');
        return res.json();
    },

    auditYearEnd: async (workflowId) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/audit/year-end`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ workflow_id: workflowId }),
        });
        if (!res.ok) throw new Error('Year-end audit failed');
        return res.json();
    },

    getGraph: async (workflowId) => {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE_URL}/v1/workflow/graph?workflow_id=${workflowId}`, {
            method: 'GET',
            headers,
        });
        if (!res.ok) throw new Error('Failed to fetch graph');
        return res.json();
    },

    // --- Legacy Tools ---
    // These might use basic auth or api key in the future, but currently keeping consistent
    legacyParse: async (file) => {
        // No Auth Header needed for legacy public/api-key endpoints if verified by key, 
        // but here we might want to check how the backend expects it.
        // Assuming Legacy endpoints use API Key from headers or query param?
        // For now, let's try standard fetch if it's public or check `v1` pattern.
        // Based on user request, it is /legacy/parse.

        const formData = new FormData();
        formData.append('file', file);

        // Note: Check if legacy requires specific auth. If it uses `auth_key` form param like before:
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY; // Or a specific backend key?
        // Looking at old script.js, it used `auth_key` in FormData.
        formData.append('auth_key', apiKey || 'test');

        const res = await fetch(`${API_BASE_URL}/legacy/parse`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Legacy parse failed');
        return res.blob(); // Returns a ZIP
    },

    legacyClassify: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        formData.append('auth_key', apiKey || 'test');

        const res = await fetch(`${API_BASE_URL}/legacy/classify`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('Legacy classify failed');
        return res.json();
    }
};

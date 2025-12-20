const API_BASE_URL = 'http://localhost:8000'; // Adjust as needed
const API_V1_URL = `${API_BASE_URL}/v1`;
const LEGACY_URL = `${API_BASE_URL}/legacy`;

// --- STATE MANAGEMENT ---
const state = {
    apiKey: localStorage.getItem('DOCINTEL_API_KEY') || '',
    workflowId: localStorage.getItem('DOCINTEL_WORKFLOW_ID') || '',
    selectedCatFile: null,
    selectedParserFile: null,
    outputFormat: 'text' // Default output format
};

// --- DOM ELEMENTS ---
const elements = {
    // Session Management
    sessionDisplay: document.getElementById('session-id-display'),
    newSessionBtn: document.getElementById('new-session-btn'),

    navItems: document.querySelectorAll('.nav-item[data-target]'),
    sections: document.querySelectorAll('.view'),

    // CAT
    catDropZone: document.getElementById('cat-drop-zone'),
    catFileInput: document.getElementById('cat-file-input'),
    catFilePreview: document.getElementById('cat-file-preview'),
    catFilename: document.getElementById('cat-filename'),
    catRemoveBtn: document.getElementById('cat-remove-file'),
    catClassifyBtn: document.getElementById('cat-classify-btn'),
    catResult: document.getElementById('cat-result'),
    catResultClass: document.getElementById('cat-result-class'),

    // Tax
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    chatSendBtn: document.getElementById('chat-send-btn'),
    chatFileInput: document.getElementById('chat-file-input'),
    chatAttachBtn: document.getElementById('chat-attach-btn'),
    formatBtns: document.querySelectorAll('.format-btn'),
    taxRulesInput: document.getElementById('tax-rules-input'),
    taxUploadRulesBtn: document.getElementById('tax-upload-rules-btn'),
    taxUploadStatus: document.getElementById('tax-upload-status'),

    // Tax Data Ingest
    taxDropZone: document.getElementById('tax-drop-zone'),
    taxFilesInput: document.getElementById('tax-files-input'),
    taxFileList: document.getElementById('tax-file-list'),
    taxIngestBtn: document.getElementById('tax-ingest-btn'),
    taxIngestStatus: document.getElementById('tax-ingest-status'),

    // Reconciliation
    runReconcileBtn: document.getElementById('run-reconcile-btn'),
    reconcileStatus: document.getElementById('reconcile-status'),
    reconcileResult: document.getElementById('reconcile-result'),
    reconcileOutput: document.getElementById('reconcile-output'),

    // Utilities
    parserFileInput: document.getElementById('parser-file-input'),
    parserRunBtn: document.getElementById('parser-run-btn'),
    parserStatus: document.getElementById('parser-status'),

    // Settings
    apiKeyInput: document.getElementById('api-key'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    toggleVisibilityBtn: document.querySelector('.toggle-visibility')
};

// --- INITIALIZATION ---
function init() {
    setupNavigation();
    setupSessionManagement();
    setupCatListeners();
    setupTaxListeners();
    setupUtilitiesListeners();
    setupSettingsListeners();

    // Init state
    if (state.apiKey) {
        elements.apiKeyInput.value = state.apiKey;
    }

    // Init workflow if exists, otherwise prompt user to create one
    if (state.workflowId) {
        updateSessionDisplay();
    } else {
        // Auto-create first session
        createNewSession();
    }
}

// --- NAVIGATION ---
function setupNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.dataset.target;

            // Sidebar active state
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // View switching
            elements.sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) section.classList.add('active');
            });
        });
    });

    // Tax Tabs
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.tab;

            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            elements.tabContents.forEach(c => c.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// --- API HELPERS ---
async function initWorkflow() {
    try {
        const res = await fetch(`${API_V1_URL}/workflow/init`, { method: 'POST' });
        const data = await res.json();
        if (data.workflow_id) {
            state.workflowId = data.workflow_id;
            localStorage.setItem('DOCINTEL_WORKFLOW_ID', state.workflowId);
            console.log("Workflow Initialized:", state.workflowId);
        }
    } catch (e) {
        console.error("Failed to init workflow", e);
    }
}

// --- SESSION MANAGEMENT ---
function setupSessionManagement() {
    elements.newSessionBtn.addEventListener('click', createNewSession);
}

async function createNewSession() {
    try {
        const res = await fetch(`${API_V1_URL}/workflow/init`, { method: 'POST' });
        const data = await res.json();
        if (data.workflow_id) {
            state.workflowId = data.workflow_id;
            localStorage.setItem('DOCINTEL_WORKFLOW_ID', state.workflowId);
            updateSessionDisplay();

            // Clear chat messages (except welcome message)
            const welcomeMsg = elements.chatMessages.querySelector('.message.system');
            elements.chatMessages.innerHTML = '';
            if (welcomeMsg) {
                elements.chatMessages.appendChild(welcomeMsg.cloneNode(true));
            }

            console.log("New Session Created:", state.workflowId);

            // Show a brief notification
            addChatMessage('New session created', 'system');
        }
    } catch (e) {
        console.error("Failed to create new session", e);
        alert("Failed to create new session. Please try again.");
    }
}

function updateSessionDisplay() {
    if (state.workflowId) {
        elements.sessionDisplay.textContent = truncateId(state.workflowId);
        elements.sessionDisplay.title = state.workflowId; // Full ID on hover
    } else {
        elements.sessionDisplay.textContent = 'No session';
        elements.sessionDisplay.title = '';
    }
}

function truncateId(id) {
    if (!id) return 'No session';
    return id.substring(0, 8) + '...';
}

// --- CAT LOGIC ---
function setupCatListeners() {
    // Drop Zone
    elements.catDropZone.addEventListener('click', () => elements.catFileInput.click());

    elements.catDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.catDropZone.style.borderColor = 'var(--primary)';
    });

    elements.catDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.catDropZone.style.borderColor = 'var(--border)';
    });

    elements.catDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.catDropZone.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files.length) {
            handleCatFile(e.dataTransfer.files[0]);
        }
    });

    elements.catFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleCatFile(e.target.files[0]);
    });

    elements.catRemoveBtn.addEventListener('click', () => {
        state.selectedCatFile = null;
        elements.catFilePreview.classList.add('hidden');
        elements.catDropZone.classList.remove('hidden');
        elements.catClassifyBtn.disabled = true;
        elements.catResult.classList.add('hidden');
        elements.catFileInput.value = '';
    });

    elements.catClassifyBtn.addEventListener('click', async () => {
        if (!state.selectedCatFile) return;
        if (!state.apiKey) return alert("Please set API Key in Settings first.");

        elements.catClassifyBtn.disabled = true;
        elements.catClassifyBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Classifying...';

        const formData = new FormData();
        formData.append('file', state.selectedCatFile);
        formData.append('auth_key', state.apiKey);

        try {
            const res = await fetch(`${LEGACY_URL}/classify`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();

            // Show result
            elements.catResult.classList.remove('hidden');
            elements.catResultClass.textContent = data.classification || "Unknown";

        } catch (error) {
            alert("Classification failed: " + error.message);
        } finally {
            elements.catClassifyBtn.disabled = false;
            elements.catClassifyBtn.innerHTML = '<i class="ph ph-magic-wand"></i> Run Classification';
        }
    });
}

function handleCatFile(file) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        alert("Only HTML files are allowed.");
        return;
    }
    state.selectedCatFile = file;
    elements.catFilename.textContent = file.name;
    elements.catDropZone.classList.add('hidden');
    elements.catFilePreview.classList.remove('hidden');
    elements.catClassifyBtn.disabled = false;
}

// --- TAX LOGIC ---
function setupTaxListeners() {
    // Output Format Toggle
    elements.formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            state.outputFormat = format;

            // Update UI
            elements.formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Chat Send
    const sendMessage = async () => {
        const text = elements.chatInput.value.trim();
        if (!text) return;
        if (!state.workflowId) await initWorkflow();

        // Add User Message
        addChatMessage(text, 'user');
        elements.chatInput.value = '';

        // Typing indicator
        const loadingId = addChatMessage('Thinking...', 'system', true);

        try {
            const res = await fetch(`${API_V1_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow_id: state.workflowId,
                    query: text,
                    output_format: state.outputFormat
                })
            });

            const data = await res.json();

            // Remove loading, add response
            removeChatMessage(loadingId);
            addChatMessage(data.response, 'system');

        } catch (e) {
            removeChatMessage(loadingId);
            addChatMessage("Error: " + e.message, 'system');
        }
    };

    elements.chatSendBtn.addEventListener('click', sendMessage);
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Tax Rules Upload
    elements.taxUploadRulesBtn.addEventListener('click', async () => {
        const file = elements.taxRulesInput.files[0];
        if (!file) return;

        elements.taxUploadStatus.textContent = "Uploading...";
        elements.taxUploadStatus.className = "status-msg";

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_V1_URL}/ingest-tax`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            elements.taxUploadStatus.textContent = "Success: " + data.status;
            elements.taxUploadStatus.className = "status-msg success";
        } catch (e) {
            elements.taxUploadStatus.textContent = "Failed: " + e.message;
            elements.taxUploadStatus.className = "status-msg error";
        }
    });



    // --- Data Ingestion Tab Logic ---
    let pendingFiles = [];

    const renderFileList = () => {
        elements.taxFileList.innerHTML = '';
        if (pendingFiles.length === 0) {
            elements.taxFileList.classList.add('hidden');
            elements.taxIngestBtn.disabled = true;
            return;
        }
        elements.taxFileList.classList.remove('hidden');
        elements.taxIngestBtn.disabled = false;

        pendingFiles.forEach((file, idx) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <div class="name">
                    <i class="ph-fill ph-file-text"></i> ${file.name}
                </div>
                <button class="icon-btn remove-file" data-idx="${idx}" title="Remove">
                    <i class="ph ph-x"></i>
                </button>
            `;
            elements.taxFileList.appendChild(div);
        });

        // Add remove listeners
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                pendingFiles.splice(idx, 1);
                renderFileList();
            });
        });
    };

    // Drop Zone
    if (elements.taxDropZone) {
        elements.taxDropZone.addEventListener('click', () => elements.taxFilesInput.click());
        elements.taxDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.taxDropZone.style.borderColor = 'var(--primary)';
        });
        elements.taxDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.taxDropZone.style.borderColor = 'var(--border)';
        });
        elements.taxDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.taxDropZone.style.borderColor = 'var(--border)';
            if (e.dataTransfer.files.length) {
                Array.from(e.dataTransfer.files).forEach(f => pendingFiles.push(f));
                renderFileList();
            }
        });
    }

    if (elements.taxFilesInput) {
        elements.taxFilesInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                Array.from(e.target.files).forEach(f => pendingFiles.push(f));
                renderFileList();
                e.target.value = ''; // Reset
            }
        });
    }

    // Ingest Button
    if (elements.taxIngestBtn) {
        elements.taxIngestBtn.addEventListener('click', async () => {
            if (!pendingFiles.length) return;
            if (!state.workflowId) await initWorkflow();

            elements.taxIngestBtn.disabled = true;
            elements.taxIngestBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';
            elements.taxIngestStatus.innerHTML = '';

            const formData = new FormData();
            formData.append('workflow_id', state.workflowId);
            pendingFiles.forEach(file => {
                formData.append('files', file);
            });

            try {
                const res = await fetch(`${API_V1_URL}/ingest`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                elements.taxIngestStatus.textContent = `Success! Processed ${data.processed_files} files.`;
                elements.taxIngestStatus.className = "status-msg success";

                // Clear list
                pendingFiles = [];
                renderFileList();

            } catch (e) {
                elements.taxIngestStatus.textContent = "Ingestion failed: " + e.message;
                elements.taxIngestStatus.className = "status-msg error";
            } finally {
                elements.taxIngestBtn.disabled = false;
                elements.taxIngestBtn.innerHTML = '<i class="ph ph-upload-simple"></i> Ingest Files';
            }
        });
    }


    // --- Reconciliation Logic ---
    if (elements.runReconcileBtn) {
        elements.runReconcileBtn.addEventListener('click', async () => {
            if (!state.workflowId) await initWorkflow();

            elements.runReconcileBtn.disabled = true;
            elements.runReconcileBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Analyzing Transactions...';
            elements.reconcileStatus.textContent = "";
            elements.reconcileResult.classList.add('hidden');

            try {
                const res = await fetch(`${API_V1_URL}/reconcile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workflow_id: state.workflowId
                    })
                });

                if (!res.ok) throw new Error(await res.text());

                const data = await res.json();

                elements.reconcileResult.classList.remove('hidden');

                // If response is an array (JSON), render a table
                if (Array.isArray(data.response)) {
                    let html = `
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    data.response.forEach(item => {
                        // Determine badge style
                        let badgeClass = 'warning'; // default
                        if (item.status && (item.status.toLowerCase().includes('match') || item.status.toLowerCase().includes('verified'))) {
                            badgeClass = 'success';
                        } else if (item.status && item.status.toLowerCase().includes('missing')) {
                            badgeClass = 'error';
                        }

                        html += `
                            <tr>
                                <td>${item.date || '-'}</td>
                                <td>${item.description || '-'}</td>
                                <td>${formatCurrency(item.amount)}</td>
                                <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
                                <td class="text-secondary">${item.notes || ''}</td>
                            </tr>
                        `;
                    });

                    html += `
                                </tbody>
                            </table>
                        </div>
                    `;
                    elements.reconcileOutput.innerHTML = html;

                } else {
                    // Fallback for markdown/string
                    let content = data.response;
                    if (typeof content === 'object') {
                        content = JSON.stringify(content, null, 2);
                    }
                    elements.reconcileOutput.innerHTML = parseMarkdown(content);
                }

                elements.reconcileStatus.textContent = "Reconciliation completed.";
                elements.reconcileStatus.className = "status-msg success";

            } catch (e) {
                elements.reconcileStatus.textContent = "Error: " + e.message;
                elements.reconcileStatus.className = "status-msg error";
            } finally {
                elements.runReconcileBtn.disabled = false;
                elements.runReconcileBtn.innerHTML = '<i class="ph ph-check-circle"></i> Run Reconciliation';
            }
        });
    }

    function formatCurrency(val) {
        if (!val && val !== 0) return '-';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    // Simple Chat File Attach (Ingest normal docs to workflow)
    elements.chatAttachBtn.addEventListener('click', () => elements.chatFileInput.click());

    elements.chatFileInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        const loadingId = addChatMessage(`Uploading ${files.length} file(s)...`, 'system', true);

        const formData = new FormData();
        formData.append('workflow_id', state.workflowId);
        for (let file of files) {
            formData.append('files', file);
        }

        try {
            const res = await fetch(`${API_V1_URL}/ingest`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            removeChatMessage(loadingId);
            addChatMessage(`Ingested ${data.processed_files} file(s) successfully.`, 'system');
        } catch (e) {
            removeChatMessage(loadingId);
            addChatMessage("Upload failed: " + e.message, 'system');
        }
    });
}

function addChatMessage(markdownText, sender, isLoading = false) {
    const id = 'msg-' + Date.now();
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.id = id;

    // Simple avatar mapping
    let icon = sender === 'user' ? 'ph-user' : 'ph-robot';
    if (isLoading) icon = 'ph-spinner ph-spin';

    // Format content based on sender and content type
    let content = markdownText;
    if (sender !== 'user') {
        // Try to detect if it's JSON
        if (typeof markdownText === 'object' || (typeof markdownText === 'string' && markdownText.trim().startsWith('{'))) {
            try {
                const jsonObj = typeof markdownText === 'string' ? JSON.parse(markdownText) : markdownText;
                content = `<pre style="background-color: var(--bg-app); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 0;"><code>${JSON.stringify(jsonObj, null, 2)}</code></pre>`;
            } catch (e) {
                content = parseMarkdown(markdownText);
            }
        } else {
            content = parseMarkdown(markdownText);
        }
    }

    div.innerHTML = `
        <div class="avatar"><i class="ph-fill ${icon}"></i></div>
        <div class="bubble">${content}</div>
    `;

    elements.chatMessages.appendChild(div);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    return id;
}

function removeChatMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function parseMarkdown(text) {
    // Very basic MD parser for now
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

// --- UTILITIES LOGIC ---
function setupUtilitiesListeners() {
    elements.parserFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            state.selectedParserFile = e.target.files[0];
            elements.parserRunBtn.disabled = false;
            elements.parserRunBtn.textContent = `Parse ${state.selectedParserFile.name}`;
        }
    });

    elements.parserRunBtn.addEventListener('click', async () => {
        if (!state.selectedParserFile) return;
        if (!state.apiKey) return alert("Please set API Key in Settings first.");

        elements.parserStatus.textContent = "Processing... this may take a moment.";
        elements.parserStatus.className = "status-msg";
        elements.parserRunBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', state.selectedParserFile);
        formData.append('auth_key', state.apiKey);

        try {
            const res = await fetch(`${LEGACY_URL}/parse`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error(await res.text());

            // It returns a blob (zip)
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `parsed_${state.selectedParserFile.name}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            elements.parserStatus.textContent = "Download started!";
            elements.parserStatus.className = "status-msg success";

        } catch (e) {
            elements.parserStatus.textContent = "Error: " + e.message;
            elements.parserStatus.className = "status-msg error";
            console.error(e);
        } finally {
            elements.parserRunBtn.disabled = false;
        }
    });
}

// --- SETTINGS LOGIC ---
function setupSettingsListeners() {
    elements.saveSettingsBtn.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            state.apiKey = key;
            localStorage.setItem('DOCINTEL_API_KEY', key);
            alert("Settings saved!");
        }
    });

    elements.toggleVisibilityBtn.addEventListener('click', () => {
        const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
        elements.apiKeyInput.type = type;
        elements.toggleVisibilityBtn.innerHTML = type === 'password' ? '<i class="ph ph-eye"></i>' : '<i class="ph ph-eye-slash"></i>';
    });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', init);

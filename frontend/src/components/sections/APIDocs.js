'use client';
import { motion } from "framer-motion";
import { useState } from 'react';
import { Shield, Key, Globe, Terminal, ChevronRight, Lock, Book } from 'lucide-react';

const endpointGroups = [
  {
    name: "Protected Endpoints 🔐",
    description: "Require Firebase Auth",
    color: "accent-blue",
    endpoints: [
      {
        method: "POST",
        path: "/v1/workflow/create",
        title: "Create Workflow",
        description: "Create new audit workspace",
      },
      {
        method: "GET",
        path: "/v1/workflow/list",
        title: "List Workflows",
        description: "List user's workflows",
      },
      {
        method: "POST",
        path: "/v1/ingest",
        title: "Ingest Documents",
        description: "Upload & process documents",
      },
      {
        method: "POST",
        path: "/v1/chat",
        title: "AI Chat",
        description: "AI chat with documents (RAG)",
      },
      {
        method: "POST",
        path: "/v1/reconcile",
        title: "Reconcile",
        description: "Transaction reconciliation",
      },
      {
        method: "POST",
        path: "/v1/audit/expenses",
        title: "Expense Audit",
        description: "Expense intelligence report",
      },
      {
        method: "POST",
        path: "/v1/audit/year-end",
        title: "Year-End Audit",
        description: "Year-end audit review",
      },
      {
        method: "GET",
        path: "/v1/workflow/graph",
        title: "Audit Graph",
        description: "Visual audit graph",
      },
    ]
  },
  {
    name: "Legacy Endpoints 🔑",
    description: "API Key Auth",
    color: "accent-green",
    endpoints: [
      {
        method: "POST",
        path: "/legacy/parse",
        title: "Parse Document",
        description: "Document parsing (returns ZIP)",
      },
      {
        method: "POST",
        path: "/legacy/classify",
        title: "Classify Document",
        description: "Document classification",
      },
    ]
  },
  {
    name: "Public Endpoint 🌐",
    description: "No authentication",
    color: "text-text-secondary",
    endpoints: [
      {
        method: "GET",
        path: "/",
        title: "Health Check",
        description: "API status and health check",
      },
    ]
  }
];

export default function APIDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState(endpointGroups[0].endpoints[0]);

  return (
    <section id="api-docs" className="py-32 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-green/5 blur-3xl rounded-full"></div>
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-card border border-border shadow-soft mb-6"
            >
              <Terminal className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-medium text-text-secondary">API Reference</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 text-text-primary"
            >
              Built for <span className="text-accent-blue">Developers</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-text-secondary max-w-3xl mx-auto"
            >
              A robust API designed to integrate document intelligence seamlessly into your workflows.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                {endpointGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-4 px-2">
                      {group.name}
                    </h3>
                    <div className="space-y-1">
                      {group.endpoints.map((endpoint, endIdx) => (
                        <button
                          key={endIdx}
                          onClick={() => setActiveEndpoint(endpoint)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                            activeEndpoint.path === endpoint.path
                              ? 'bg-accent-blue/10 text-accent-blue shadow-sm'
                              : 'text-text-secondary hover:bg-background-subtle'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                endpoint.method === 'POST' ? 'border-blue-500/50 text-blue-500' : 'border-green-500/50 text-green-500'
                            }`}>
                                {endpoint.method}
                            </span>
                            <span className="font-medium">{endpoint.title}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            activeEndpoint.path === endpoint.path ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Documentation Link Card */}
                <div className="bg-gradient-to-br from-accent-blue to-accent-blue-soft p-6 rounded-2xl text-white shadow-elevated group cursor-pointer overflow-hidden relative">
                   <div className="relative z-10">
                        <Book className="w-8 h-8 mb-4" />
                        <h4 className="text-xl font-bold mb-2">Full Documentation</h4>
                        <p className="text-white/80 text-sm mb-4">Explore complete guides, SDKs and implementation examples.</p>
                        <div className="flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                            View Docs <ArrowRight className="w-4 h-4" />
                        </div>
                   </div>
                   <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-8">
              <motion.div
                key={activeEndpoint.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-background-card border border-border rounded-3xl p-8 md:p-10 shadow-elevated"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">{activeEndpoint.title}</h2>
                    <p className="text-text-secondary text-lg">{activeEndpoint.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-background-subtle border border-border font-mono text-accent-blue font-bold">
                      {activeEndpoint.method}
                    </span>
                    <span className="px-4 py-2 rounded-lg bg-background-subtle border border-border font-mono text-text-primary">
                      {activeEndpoint.path}
                    </span>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Authentication Section */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-accent-blue" />
                        Authentication
                    </h3>
                    <div className="p-4 rounded-2xl bg-background-subtle border border-border text-text-secondary text-sm">
                        {activeEndpoint.path.startsWith('/v1') ? (
                            <p>This endpoint requires a <span className="text-text-primary font-medium underline decoration-accent-blue/30">Firebase ID Token</span> passed in the <code className="bg-white/10 px-1.5 py-0.5 rounded">Authorization: Bearer {'<token>'}</code> header.</p>
                        ) : activeEndpoint.path.startsWith('/legacy') ? (
                            <p>This endpoint requires an <span className="text-text-primary font-medium underline decoration-accent-green/30">API Key</span> passed in the <code className="bg-white/10 px-1.5 py-0.5 rounded">X-API-Key</code> header.</p>
                        ) : (
                            <p>This is a public endpoint and does not require authentication.</p>
                        )}
                    </div>
                  </div>

                  {/* Request Example */}
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-accent-blue" />
                        Request Example
                    </h3>
                    <div className="relative group">
                        <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-accent-blue transition-colors">Bash / Curl</div>
                        <pre className="p-6 rounded-2xl bg-[#0f172a] text-blue-300 font-mono text-sm overflow-x-auto leading-relaxed shadow-inner">
                            <code>{`curl -X ${activeEndpoint.method} "https://api.niyamr.flow${activeEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  ${activeEndpoint.path.startsWith('/v1') ? '-H "Authorization: Bearer YOUR_TOKEN"' : activeEndpoint.path.startsWith('/legacy') ? '-H "X-API-Key: YOUR_API_KEY"' : ''}`}</code>
                        </pre>
                    </div>
                  </div>

                   {/* Response Example */}
                   <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Response</h3>
                    <pre className="p-6 rounded-2xl bg-background-subtle border border-border text-text-secondary font-mono text-sm overflow-x-auto">
                        <code>{`{
  "status": "success",
  "data": {
    "id": "wf_72819",
    "message": "Operation completed successfully"
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowRight(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    )
  }

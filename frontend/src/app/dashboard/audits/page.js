'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   ShieldCheck,
   FilePieChart,
   Calendar,
   ArrowRight,
   Download,
   AlertCircle,
   CheckCircle2,
   RefreshCw,
   Plus,
   Loader2
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const auditTools = [
   {
      id: 'expenses',
      title: "Expense Intelligence",
      description: "Automated analysis of corporate expenses, identifying patterns and anomalies.",
      icon: FilePieChart,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      status: "Ready",
      action: api.auditExpenses
   },
   {
      id: 'year-end',
      title: "Year-End Review",
      description: "Comprehensive audit for fiscal year closure and regulatory compliance.",
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      status: "Ready",
      action: api.auditYearEnd
   },
   {
      id: 'reconcile',
      title: "Transaction Reconciliation",
      description: "Match transactions across multiple documents and bank statements.",
      icon: RefreshCw,
      color: "text-green-500",
      bg: "bg-green-500/10",
      status: "Active",
      action: api.reconcile
   }
];

export default function AuditsPage() {
   const { user } = useAuth();
   const [workflows, setWorkflows] = useState([]);
   const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
   const [runningAudit, setRunningAudit] = useState(null); // id of running audit
   const [auditResult, setAuditResult] = useState(null);

   // Fetch workflows
   useEffect(() => {
      async function init() {
         if (user) {
            try {
               const wfs = await api.getWorkflows();
               setWorkflows(wfs);
               if (wfs.length > 0) setSelectedWorkflowId(wfs[0].id);
            } catch (e) {
               console.error("Failed to load workflows", e);
            }
         }
      }
      init();
   }, [user]);

   const handleRunAudit = async (toolI) => {
      if (!selectedWorkflowId) {
         alert("Please select a workflow workspace first.");
         return;
      }
      setRunningAudit(toolI.id);
      setAuditResult(null);
      try {
         const res = await toolI.action(selectedWorkflowId);
         setAuditResult({
            tool: toolI.title,
            data: JSON.stringify(res, null, 2)
         });
      } catch (e) {
         alert("Audit failed: " + e.message);
      } finally {
         setRunningAudit(null);
      }
   };

   return (
      <div className="space-y-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-text-primary mb-2">Audit & Compliance Center</h1>
               <p className="text-text-secondary">Run automated audit checks and generate intelligence reports.</p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative">
                  <select
                     value={selectedWorkflowId}
                     onChange={(e) => setSelectedWorkflowId(e.target.value)}
                     className="appearance-none bg-background-card border border-border px-4 py-3 pr-10 rounded-xl font-bold text-text-secondary hover:border-accent-blue outline-none transition-all cursor-pointer"
                  >
                     <option value="" disabled>Select Workspace</option>
                     {workflows.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                     ))}
                  </select>
               </div>
            </div>
         </div>

         {auditResult && (
            <div className="bg-background-card border border-border p-6 rounded-2xl shadow-elevated transition-all">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  Report: <span className="text-accent-blue">{auditResult.tool}</span>
               </h3>

               <div className="bg-background-subtle/30 rounded-xl overflow-hidden border border-border">
                  {(() => {
                     try {
                        const data = JSON.parse(auditResult.data);

                        // --- 1. Expense Intelligence Renderer ---
                        if (auditResult.tool.includes('Expense')) {
                           // Expecting List of Objects
                           const items = Array.isArray(data) ? data : (data.report || []);
                           if (items.length === 0) return <div className="p-8 text-center text-text-secondary">No expense anomalies detected.</div>;

                           return (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm">
                                    <thead className="bg-background-subtle text-text-secondary text-xs uppercase font-bold tracking-wider">
                                       <tr>
                                          <th className="p-4">Date</th>
                                          <th className="p-4">Description</th>
                                          <th className="p-4">Amount</th>
                                          <th className="p-4">Verdict</th>
                                          <th className="p-4">Risk</th>
                                          <th className="p-4">Reasoning</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                       {items.map((item, i) => (
                                          <tr key={i} className="hover:bg-background-subtle/50 transition-colors">
                                             <td className="p-4 font-medium">{item.date}</td>
                                             <td className="p-4 text-text-secondary">{item.description}</td>
                                             <td className="p-4 font-bold">{item.amount}</td>
                                             <td className="p-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.verdict === 'Allowable' ? 'bg-green-500/10 text-green-500' :
                                                   item.verdict === 'Disallowable' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                                                   }`}>
                                                   {item.verdict}
                                                </span>
                                             </td>
                                             <td className="p-4">{item.risk_flag}</td>
                                             <td className="p-4 text-xs text-text-secondary max-w-xs">{item.reasoning}</td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           );
                        }

                        // --- 2. Year-End Review Renderer ---
                        if (auditResult.tool.includes('Year-End')) {
                           // Expecting Object { completeness_score, compliance_notes, ... }
                           const report = data.report || data;
                           return (
                              <div className="p-6 space-y-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-accent-blue/10 text-accent-blue">
                                       <p className="text-xs font-bold uppercase tracking-wider">Completeness Score</p>
                                       <p className="text-3xl font-bold">{report.completeness_score || 'N/A'}</p>
                                    </div>
                                    <div className="flex-1 p-4 rounded-2xl bg-background-card border border-border">
                                       <p className="text-xs font-bold text-text-secondary uppercase mb-1">Auditor Summary</p>
                                       <p className="text-sm text-text-primary">{report.auditor_summary}</p>
                                    </div>
                                 </div>

                                 <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-4 rounded-xl border border-border bg-background-card">
                                       <h4 className="font-bold text-text-primary mb-3">Compliance Notes</h4>
                                       <p className="text-sm text-text-secondary whitespace-pre-wrap">{report.compliance_notes}</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-border bg-background-card">
                                       <h4 className="font-bold text-text-primary mb-3">Working Papers Generated</h4>
                                       <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                                          {Object.entries(report.working_papers || {}).map(([key, val]) => (
                                             <li key={key} className="capitalize">{key.replace(/_/g, ' ')}</li>
                                          ))}
                                       </ul>
                                    </div>
                                 </div>
                              </div>
                           );
                        }

                        // --- 3. Reconciliation Renderer ---
                        if (auditResult.tool.includes('Reconciliation')) {
                           // Expecting List of Discrepancies OR Empty List
                           const items = Array.isArray(data.response) ? data.response : (data.matches || []);

                           if (items.length === 0) {
                              return (
                                 <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                    <h4 className="text-lg font-bold text-text-primary">Perfect Match!</h4>
                                    <p className="text-text-secondary max-w-sm mt-2">
                                       We analyzed all documents in this workflow and found 0 discrepancies between the ledger and invoices.
                                    </p>
                                 </div>
                              );
                           }

                           return (
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left text-sm">
                                    <thead className="bg-red-500/10 text-red-500 text-xs uppercase font-bold tracking-wider">
                                       <tr>
                                          <th className="p-4">Date</th>
                                          <th className="p-4">Amount</th>
                                          <th className="p-4">Description</th>
                                          <th className="p-4">Issue</th>
                                          <th className="p-4">Notes</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                       {items.map((row, i) => (
                                          <tr key={i} className="hover:bg-background-subtle/50 transition-colors">
                                             <td className="p-4">{row.date}</td>
                                             <td className="p-4 font-bold">{row.amount}</td>
                                             <td className="p-4">{row.description}</td>
                                             <td className="p-4 font-bold text-red-500">{row.issue}</td>
                                             <td className="p-4 text-xs text-text-secondary">{row.notes}</td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           );
                        }

                        // Fallback for unknown tools
                        return <pre className="p-4 text-xs overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>;

                     } catch (e) {
                        // Fallback for non-JSON string
                        return <pre className="p-6 text-sm whitespace-pre-wrap font-mono text-text-secondary">{auditResult.data}</pre>;
                     }
                  })()}
               </div>
            </div>
         )}

         {/* Audit Tools Grid */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {auditTools.map((tool, index) => (
               <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !runningAudit && handleRunAudit(tool)}
                  className={`bg-background-card p-8 rounded-3xl border border-border shadow-soft group hover:border-accent-blue transition-all cursor-pointer relative overflow-hidden ${runningAudit === tool.id ? 'opacity-70 pointer-events-none' : ''}`}
               >
                  <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                     {runningAudit === tool.id ? <Loader2 className={`w-8 h-8 ${tool.color} animate-spin`} /> : <tool.icon className={`w-8 h-8 ${tool.color}`} />}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{tool.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-6">{tool.description}</p>

                  <div className="flex items-center justify-between mt-auto">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tool.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-accent-blue/10 text-accent-blue'
                        }`}>
                        {runningAudit === tool.id ? 'Running...' : tool.status}
                     </span>
                     <div className="flex items-center gap-1 text-accent-blue font-bold text-sm">
                        {runningAudit === tool.id ? 'Processing' : 'Run Now'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                  {/* Subtle background decoration */}
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${tool.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
               </motion.div>
            ))}
         </div>

         <div className="grid lg:grid-cols-2 gap-10">
            {/* Compliance Overview */}
            <div className="bg-background-card p-8 rounded-3xl border border-border shadow-soft">
               <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-accent-green" />
                  Compliance Health
               </h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-background-subtle border border-border">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                           <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-bold text-text-primary">Tax Readiness</p>
                           <p className="text-xs text-text-secondary">All documents verified</p>
                        </div>
                     </div>
                     <span className="text-lg font-bold text-green-500">100%</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-background-subtle border border-border">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                           <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-bold text-text-primary">Policy Adherence</p>
                           <p className="text-xs text-text-secondary">3 flags detected in expenses</p>
                        </div>
                     </div>
                     <span className="text-lg font-bold text-orange-500">84%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

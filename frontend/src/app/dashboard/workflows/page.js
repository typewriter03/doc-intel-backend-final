'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   Plus,
   Search,
   MoreVertical,
   Layers,
   ChevronRight,
   GitBranch,
   Calendar,
   Loader2,
   Trash2
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import GraphVisualizer from '@/components/ui/GraphVisualizer';
import sampleGraphData from '@/data/sampleGraph.json';
import invoiceFlowData from '@/data/invoiceFlowGraph.json';

export default function WorkflowsPage() {
   const { user } = useAuth();
   const [workflows, setWorkflows] = useState([]);
   const [activeGraph, setActiveGraph] = useState(null); // { id, name, data }
   const [isFullScreen, setIsFullScreen] = useState(false);
   const [graphLoading, setGraphLoading] = useState(false);

   const [loading, setLoading] = useState(true);

   // Fetch Workflows
   const fetchWorkflows = async () => {
      if (!user) return;
      setLoading(true);
      try {
         const wfs = await api.getWorkflows();
         setWorkflows(wfs);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchWorkflows();
   }, [user]);

   // Create Workflow
   const handleCreateWorkflow = async () => {
      const name = prompt("Enter workflow name:");
      if (name) {
         try {
            await api.createWorkflow(name);
            fetchWorkflows();
         } catch (e) {
            alert("Failed to create workflow");
         }
      }
   };

   // Delete Workflow
   const handleDeleteWorkflow = async (e, id, name) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete workspace "${name}"? This action cannot be undone.`)) {
         try {
            await api.deleteWorkflow(id);
            // Optimistic update or refresh
            setWorkflows(workflows.filter(w => w.id !== id));
            if (activeGraph?.id === id) setActiveGraph(null);
         } catch (err) {
            console.error(err);
            alert("Failed to delete workspace");
         }
      }
   };

   // Fetch Graph
   const fetchGraph = async (wf) => {
      setGraphLoading(true);
      try {
         const data = await api.getGraph(wf.id);
         setActiveGraph({ id: wf.id, name: wf.name, data });
      } catch (e) {
         console.error(e);
         alert("Could not load graph for " + wf.name);
      } finally {
         setGraphLoading(false);
      }
   };

   return (
      <div className="space-y-8 relative">
         {/* Full Screen Modal */}
         {isFullScreen && activeGraph && (
            <div className="fixed inset-0 z-50 bg-background-base flex flex-col">
               <div className="flex items-center justify-between p-4 border-b border-border bg-background-card">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                     <GitBranch className="w-5 h-5 text-accent-blue" />
                     {activeGraph.name} <span className="text-text-secondary text-sm font-normal">Knowledge Graph</span>
                  </h2>
                  <button
                     onClick={() => setIsFullScreen(false)}
                     className="px-4 py-2 bg-background-subtle hover:bg-background-subtle/80 rounded-lg text-sm font-bold"
                  >
                     Close View
                  </button>
               </div>
               <div className="flex-1 relative">
                  <GraphVisualizer data={activeGraph.data} />
               </div>
            </div>
         )}

         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-text-primary mb-2">Audit Workflows</h1>
               <p className="text-text-secondary">Manage and visualize your document audit workspaces.</p>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={() => workflows.length > 0 && fetchGraph(workflows[0])}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border font-bold text-text-primary hover:bg-background-subtle transition-all"
               >
                  <GitBranch className="w-5 h-5 text-accent-blue" />
                  Visual Graph
               </button>
               <button
                  onClick={handleCreateWorkflow}
                  className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-soft text-white px-6 py-3 rounded-xl font-bold transition-all shadow-soft hover:shadow-elevated"
               >
                  <Plus className="w-5 h-5" />
                  New Workflow
               </button>
               <button
                  onClick={() => setActiveGraph({ id: 'invoice_demo', name: 'Invoice Transaction Flow', data: invoiceFlowData })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-dashed border-accent-blue text-accent-blue font-bold hover:bg-accent-blue/5 transition-all"
               >
                  <GitBranch className="w-5 h-5" />
                  View Invoice Demo
               </button>
            </div>
         </div>

         {/* Filters & Search - Visual Only for now */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background-card border border-border rounded-2xl shadow-soft">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
               <input
                  type="text"
                  placeholder="Search workspaces..."
                  className="w-full bg-background-subtle border border-border rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:border-accent-blue transition-all"
               />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
               {['All', 'Active', 'Completed', 'Draft'].map((filter) => (
                  <button key={filter} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'All' ? 'bg-accent-blue text-white' : 'bg-background-subtle text-text-secondary hover:text-text-primary'
                     }`}>
                     {filter}
                  </button>
               ))}
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center p-12">
               <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
            </div>
         ) : (
            /* Workflow Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {workflows.map((wf, index) => (
                  <motion.div
                     key={wf.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.1 }}
                     onClick={() => fetchGraph(wf)}
                     className={`bg-background-card border rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-all group cursor-pointer border-l-4 ${activeGraph?.id === wf.id ? 'border-accent-blue ring-2 ring-accent-blue/20' : 'border-border border-l-transparent hover:border-l-accent-blue'
                        }`}
                  >
                     <div className="flex items-center justify-between mb-6">
                        <div className="p-3 rounded-xl bg-accent-blue/10 text-accent-blue">
                           <Layers className="w-6 h-6" />
                        </div>
                        <button
                           onClick={(e) => handleDeleteWorkflow(e, wf.id, wf.name)}
                           className="p-2 hover:bg-red-500/10 text-text-secondary hover:text-red-500 rounded-lg transition-all"
                           title="Delete Workspace"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                     </div>

                     <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-blue transition-colors">{wf.name}</h3>

                     <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-text-secondary flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Created
                           </span>
                           <span className="font-bold text-text-primary">
                              {new Date(wf.created_at).toLocaleDateString()}
                           </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-text-secondary flex items-center gap-2">
                              <Layers className="w-4 h-4" />
                              Documents
                           </span>
                           <span className="font-bold text-text-primary">{wf.docs} files</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-6 border-t border-border">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-accent-blue/10 text-accent-blue`}>
                           Active
                        </span>
                        {activeGraph?.id === wf.id && <span className="text-xs font-bold text-accent-blue animate-pulse">Viewing Graph</span>}
                     </div>
                  </motion.div>
               ))}

               {/* Add New Placeholder */}
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleCreateWorkflow}
                  className="border-2 border-dashed border-border rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer min-h-[300px]"
               >
                  <div className="w-16 h-16 rounded-full bg-background-subtle flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <Plus className="w-8 h-8 text-text-secondary group-hover:text-accent-blue" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-1">Create New Workspace</h3>
                  <p className="text-xs text-text-secondary">Set up a new audit project.</p>
               </motion.div>
            </div>
         )}

         {/* Graph Visualization Preview */}
         <div className="bg-background-card border border-border rounded-3xl p-8 shadow-soft overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                     <GitBranch className="w-6 h-6 text-accent-blue" />
                     {activeGraph ? `Graph: ${activeGraph.name}` : 'Knowledge Graph Visualization'}
                  </h3>
                  <p className="text-text-secondary text-sm">
                     {activeGraph ? 'Visualizing entity relationships and transaction flow.' : 'Select a workspace above to view its audit map.'}
                  </p>
               </div>

               {activeGraph && (
                  <button
                     onClick={() => setIsFullScreen(true)}
                     className="text-sm font-bold text-accent-blue flex items-center gap-1 hover:underline bg-accent-blue/10 px-4 py-2 rounded-lg"
                  >
                     Open Full Screen <ChevronRight className="w-4 h-4" />
                  </button>
               )}
            </div>

            <div className="flex-1 bg-background-subtle rounded-2xl border border-border flex items-center justify-center relative overflow-hidden">
               {graphLoading ? (
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                     <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
                     <p className="font-bold text-text-secondary">Building Graph using LLM...</p>
                  </div>
               ) : activeGraph ? (
                  <GraphVisualizer data={activeGraph.data} />
               ) : (
                  <div className="text-center relative z-10">
                     <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                     <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full bg-accent-blue/10 flex items-center justify-center">
                           <Layers className="w-10 h-10 text-accent-blue animate-pulse" />
                        </div>
                     </div>
                     <p className="font-bold text-text-primary">Interactive Document Relationships</p>
                     <p className="text-xs text-text-secondary mt-1">Select a workspace to view the visual audit map.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

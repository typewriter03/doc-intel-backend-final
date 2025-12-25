'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Upload,
   File,
   Search,
   Filter,
   MoreHorizontal,
   Download,
   Trash2,
   CheckCircle2,
   Clock,
   AlertCircle,
   Zap,
   Tag
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useWorkflow } from '@/context/WorkflowContext';

export default function DocumentsPage() {
   const { user } = useAuth();
   const { workflows, activeWorkflowId: selectedWorkflowId, setActiveWorkflowId: setSelectedWorkflowId } = useWorkflow();
   const [isDragging, setIsDragging] = useState(false);
   const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
   const [statusMessage, setStatusMessage] = useState('');

   const handleDrop = async (e) => {
      e.preventDefault();
      setIsDragging(false);

      if (!selectedWorkflowId) {
         alert("Please create or select a workflow first.");
         return;
      }

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
         await uploadFiles(files);
      }
   };

   const handleFileSelect = async (e) => {
      if (!selectedWorkflowId) {
         alert("Please select a workflow first.");
         return;
      }
      const files = Array.from(e.target.files);
      if (files.length > 0) {
         await uploadFiles(files);
      }
   };

   const uploadFiles = async (files) => {
      setUploadStatus('uploading');
      setStatusMessage(`Uploading and Processing${files.length} file(s)...`);

      try {
         const res = await api.ingestFiles(selectedWorkflowId, files);
         setUploadStatus('success');
         setStatusMessage(`Successfully processed ${res.processed_files} files.`);
         setTimeout(() => setUploadStatus(null), 3000);
      } catch (e) {
         setUploadStatus('error');
         setStatusMessage("Upload failed: " + e.message);
      }
   };

   return (
      <div className="space-y-8">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h1 className="text-3xl font-bold text-text-primary mb-2">Document Hub</h1>
               <p className="text-text-secondary">Upload, process, and manage your intelligence source files.</p>
            </div>

            {/* Workflow Selector */}
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                     <Filter className="w-4 h-4 text-text-secondary" />
                  </div>
               </div>
            </div>
         </div>

         {/* Upload Zone */}
         <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-accent-blue bg-accent-blue/5' : 'border-border bg-background-card hover:border-accent-blue/50'
               }`}
         >
            <div className="w-20 h-20 rounded-full bg-accent-blue/10 flex items-center justify-center mb-6">
               <Upload className={`w-10 h-10 ${isDragging ? 'text-accent-blue animate-bounce' : 'text-accent-blue'}`} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Drag and drop your files here</h3>
            <p className="text-text-secondary max-w-sm mb-6">Support for PDF, DOCX, XLSX, and Image files up to 50MB each.</p>

            <input
               type="file"
               id="file-upload"
               multiple
               className="hidden"
               onChange={handleFileSelect}
            />
            <button
               onClick={() => document.getElementById('file-upload').click()}
               className="bg-background-subtle border border-border px-8 py-3 rounded-xl font-bold text-text-primary hover:bg-border transition-all"
            >
               Select Files from Computer
            </button>

            {uploadStatus && (
               <div className={`mt-6 px-6 py-3 rounded-xl border font-bold ${uploadStatus === 'uploading' ? 'bg-background-subtle border-border text-text-secondary' :
                  uploadStatus === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                     'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                  {statusMessage}
               </div>
            )}
         </div>

         {/* Placeholder Note */}
         <div className="p-8 text-center text-text-secondary bg-background-subtle/50 rounded-xl">
            <p>Uploaded files are automatically processed and added to your selected Workflow graph.</p>
            <p className="text-xs mt-2 opacity-60">Complete file management view coming soon.</p>
         </div>
      </div>
   );
}

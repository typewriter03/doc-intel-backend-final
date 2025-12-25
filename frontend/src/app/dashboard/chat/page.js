'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Send,
   Bot,
   User,
   Paperclip,
   MoreHorizontal,
   Sparkles,
   Search,
   Plus
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useWorkflow } from '@/context/WorkflowContext';

export default function ChatPage() {
   const { user } = useAuth();
   const { workflows, activeWorkflowId, setActiveWorkflowId } = useWorkflow();
   const [messages, setMessages] = useState([
      { id: 1, role: 'assistant', text: "Hello! I'm your AI Document Assistant. Select a workflow context to start chatting.", time: 'Now' }
   ]);
   const [input, setInput] = useState('');
   const [isTyping, setIsTyping] = useState(false);

   // Fetch history when active workflow changes
   useEffect(() => {
      async function loadHistory() {
         if (activeWorkflowId) {
            try {
               const history = await api.getChatHistory(activeWorkflowId);
               const formattedMessages = [];

               // Always start with the system greeting
               formattedMessages.push({
                  id: 'system-1',
                  role: 'assistant',
                  text: "Hello! I'm your AI Document Assistant. How can I help you with this workflow today?",
                  time: 'Live'
               });

               history.forEach((h, idx) => {
                  formattedMessages.push({
                     id: `u-${idx}`,
                     role: 'user',
                     text: h.user_query,
                     time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  });
                  formattedMessages.push({
                     id: `a-${idx}`,
                     role: 'assistant',
                     text: h.bot_response,
                     time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  });
               });

               setMessages(formattedMessages);
            } catch (e) {
               console.error("Failed to load chat history", e);
            }
         } else {
            setMessages([
               { id: 1, role: 'assistant', text: "Hello! I'm your AI Document Assistant. Select a workflow context to start chatting.", time: 'Now' }
            ]);
         }
      }
      loadHistory();
   }, [activeWorkflowId]);

   const handleSend = async () => {
      if (!input.trim() || !activeWorkflowId) return;

      const userText = input;
      const newMsg = { id: Date.now(), role: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, newMsg]);
      setInput('');
      setIsTyping(true);

      try {
         const data = await api.chat(activeWorkflowId, userText);

         let responseText = "";
         let sources = [];

         // Handle different response formats (string vs object)
         if (typeof data.response === 'string') {
            responseText = data.response;
         } else if (typeof data.response === 'object') {
            // If it's structured, maybe it has a message or just stringify it
            responseText = JSON.stringify(data.response, null, 2);
         }

         if (data.sources) sources = data.sources;

         const aiMsg = {
            id: Date.now() + 1,
            role: 'assistant',
            text: responseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sources: sources
         };
         setMessages(prev => [...prev, aiMsg]);

      } catch (e) {
         setMessages(prev => [...prev, {
            id: Date.now() + 1,
            role: 'assistant',
            text: "Sorry, I encountered an error: " + e.message,
            time: 'Now'
         }]);
      } finally {
         setIsTyping(false);
      }
   };

   return (
      <div className="h-[calc(100vh-160px)] flex gap-8">
         {/* Main Chat Area */}
         <div className="flex-1 flex flex-col bg-background-card border border-border rounded-3xl overflow-hidden shadow-elevated">
            {/* Chat Header */}
            <div className="px-8 py-4 border-b border-border bg-background-card/50 backdrop-blur-sm flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center">
                     <Bot className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                     <h3 className="font-bold text-text-primary">AI Document Assistant</h3>
                     {activeWorkflowId ? (
                        <div className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span>
                           <span className="text-xs text-text-secondary">Connected to: {workflows.find(w => w.id === activeWorkflowId)?.name || 'Unknown'}</span>
                        </div>
                     ) : (
                        <span className="text-xs text-orange-500">No workflow selected</span>
                     )}
                  </div>
               </div>
               <button className="p-2 hover:bg-background-subtle rounded-lg transition-all">
                  <MoreHorizontal className="w-5 h-5 text-text-secondary" />
               </button>
            </div>

            {/* Messages Window */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <AnimatePresence>
                  {messages.map((msg) => (
                     <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                     >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-accent-blue text-white' : 'bg-background-subtle border border-border text-text-primary'
                           }`}>
                           {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
                           <div className={`p-4 rounded-2xl shadow-sm overflow-auto ${msg.role === 'assistant'
                              ? 'bg-background-subtle border border-border text-text-primary rounded-tl-none'
                              : 'bg-accent-blue text-white rounded-tr-none'
                              }`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                 {msg.text.split(/(\*\*.*?\*\*)/).map((part, index) =>
                                    part.startsWith('**') && part.endsWith('**') ?
                                       <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong> :
                                       part
                                 )}
                              </p>
                           </div>
                           {msg.sources && msg.sources.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                 {msg.sources.map((source, i) => (
                                    <span key={i} className="text-[10px] font-bold px-2 py-1 rounded-md bg-accent-blue/5 border border-accent-blue/20 text-accent-blue">
                                       📄 {source}
                                    </span>
                                 ))}
                              </div>
                           )}
                           <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold px-1">{msg.time}</span>
                        </div>
                     </motion.div>
                  ))}
                  {isTyping && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center"><Bot className="w-5 h-5" /></div>
                        <div className="bg-background-subtle border border-border p-4 rounded-2xl rounded-tl-none">
                           <span className="text-xs text-text-secondary animate-pulse">Thinking...</span>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-border bg-background-card/50">
               <div className="relative flex items-center gap-4">
                  <button className="p-3 hover:bg-background-subtle rounded-xl text-text-secondary transition-all">
                     <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about your documents..."
                        disabled={!activeWorkflowId}
                        className="w-full bg-background-subtle border border-border rounded-2xl py-4 px-6 pr-14 text-text-primary placeholder:text-text-secondary outline-none focus:border-accent-blue transition-all disabled:opacity-50"
                     />
                     <button
                        onClick={handleSend}
                        disabled={!activeWorkflowId || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent-blue hover:bg-accent-blue-soft text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <Send className="w-5 h-5" />
                     </button>
                  </div>
                  <button className="p-3 bg-accent-blue/10 hover:bg-accent-blue/20 rounded-xl text-accent-blue transition-all group">
                     <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
            </div>
         </div>

         {/* Sidebar - Context & Sources */}
         <div className="w-80 flex flex-col gap-6">
            <div className="bg-background-card border border-border rounded-3xl p-6 shadow-soft">
               <h4 className="font-bold text-text-primary mb-4 flex items-center justify-between">
                  Context
               </h4>
               <div className="space-y-2">
                  {workflows.map(wf => (
                     <div
                        key={wf.id}
                        onClick={() => setActiveWorkflowId(wf.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${activeWorkflowId === wf.id
                           ? 'bg-accent-blue/10 border-accent-blue'
                           : 'bg-transparent border-border hover:bg-background-subtle'
                           }`}
                     >
                        <p className={`text-sm font-bold ${activeWorkflowId === wf.id ? 'text-accent-blue' : 'text-text-primary'}`}>{wf.name}</p>
                        <p className="text-[10px] text-text-secondary">ID: {wf.id.substring(0, 8)}...</p>
                     </div>
                  ))}
                  {workflows.length === 0 && <p className="text-xs text-text-secondary">No workflows found. Create one in Dashboard.</p>}
               </div>
            </div>
         </div>
      </div>
   );
}

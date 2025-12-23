'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Zap,
  Activity,
  Clock
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardOverview() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [stats, setStats] = useState([
    { name: 'Total Workflows', value: '-', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Processed Docs', value: '-', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'System Uptime', value: '99.9%', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]);
  const [loadingData, setLoadingData] = useState(false);
  const [analytics, setAnalytics] = useState({
    document_timeline: [],
    file_types: {},
    total_docs: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setLoadingData(true);
        try {
          const [wfs, analyticsData] = await Promise.all([
            api.getWorkflows(),
            api.getAnalytics(7)
          ]);

          setWorkflows(wfs);
          setAnalytics(analyticsData);

          setStats([
            { name: 'Total Workflows', value: wfs.length.toString(), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { name: 'Processed Docs', value: analyticsData.total_docs.toString(), icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
            { name: 'System Uptime', value: '100%', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          ]);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingData(false);
        }
      }
    }
    fetchData();
  }, [user]);

  const handleCreateWorkflow = async () => {
    const name = prompt("Enter workflow name:");
    if (name) {
      try {
        await api.createWorkflow(name);
        const wfs = await api.getWorkflows();
        setWorkflows(wfs);
      } catch (e) {
        alert("Failed to create workflow");
      }
    }
  };

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user.displayName || 'User'}</h1>
          <p className="text-text-secondary">Here's what's happening across your document intelligence workflows.</p>
        </div>
        <button
          onClick={handleCreateWorkflow}
          className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue-soft text-white px-6 py-3 rounded-xl font-bold transition-all shadow-soft hover:shadow-elevated hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5" />
          Create Workflow
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-background-card p-6 rounded-2xl border border-border shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-text-secondary text-sm font-medium mb-1">{stat.name}</h3>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Graph - Document Volume */}
        <div className="lg:col-span-2 bg-background-card p-8 rounded-3xl border border-border shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text-primary">Document Volume Trend</h3>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-accent-blue" /> Uploaded Docs
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end gap-3 px-2">
            {analytics.document_timeline && analytics.document_timeline.length > 0 ? (
              analytics.document_timeline.map((item, i) => {
                const maxCount = Math.max(...analytics.document_timeline.map(t => t.count), 1);
                const heightValue = (item.count / maxCount) * 100;
                // Ensure a minimum height for visibility even if count is 0, but only if there are entries
                const displayHeight = Math.max(heightValue, item.count > 0 ? 5 : 2);

                const dateObj = new Date(item.date);
                const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full">
                    <div className="flex-1 w-full relative flex items-end justify-center">
                      <motion.div
                        initial={{ height: "0%" }}
                        animate={{ height: `${displayHeight}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                        className="w-full max-w-[32px] bg-blue-500 rounded-t-lg relative group-hover:bg-blue-600 transition-all shadow-md"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                          <div className="font-bold">{item.count} docs</div>
                          <div className="text-[8px] opacity-70">{item.date}</div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
                        </div>
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</span>
                      <div className="text-[8px] text-text-muted mt-0.5">{dateObj.getDate()}/{dateObj.getMonth() + 1}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary opacity-50 italic">
                No activity data available
              </div>
            )}
          </div>
        </div>

        {/* File Types Breakdown */}
        <div className="bg-background-card p-8 rounded-3xl border border-border shadow-soft">
          <h3 className="text-xl font-bold text-text-primary mb-6">File Distribution</h3>
          <div className="space-y-4">
            {Object.keys(analytics.file_types).length > 0 ? (
              Object.entries(analytics.file_types).map(([ext, count], index) => {
                const total = analytics.total_docs || 1;
                const percentage = (count / total) * 100;
                const colors = [
                  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'
                ];

                return (
                  <div key={ext} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-text-primary uppercase">{ext}</span>
                      <span className="text-text-secondary">{Math.round(percentage)}%</span>
                    </div>
                    <div className="w-full h-2 bg-background-subtle rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${colors[index % colors.length]}`}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-text-secondary text-sm">No documents processed yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-background-card p-8 rounded-3xl border border-border shadow-soft">
          <h3 className="text-xl font-bold text-text-primary mb-6">Recent Workflows</h3>
          <div className="space-y-6">
            {workflows.length === 0 ? (
              <p className="text-text-secondary">No workflows yet.</p>
            ) : (
              workflows.slice(0, 5).map((wf, index) => (
                <div key={wf.id || index} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-background-subtle border border-border flex items-center justify-center shrink-0 group-hover:border-accent-blue transition-all">
                    <Clock className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0 border-b border-border pb-4 group-last:border-0">
                    <p className="text-sm font-bold text-text-primary truncate">{wf.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-text-secondary">{wf.created_at || 'Unknown date'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(wf.status || 'Active') === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>
                        {wf.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

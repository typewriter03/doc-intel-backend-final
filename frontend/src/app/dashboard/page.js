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
  const [activityData, setActivityData] = useState([0, 0, 0, 0, 0, 0, 0]);

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
          const wfs = await api.getWorkflows();
          setWorkflows(wfs);

          // Calculate "Processed Docs"
          const totalDocs = wfs.reduce((sum, wf) => sum + (wf.docs || 0), 0);

          // Calculate Activity (Last 7 Days)
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          // Count workflows per day
          const activityMap = wfs.reduce((acc, wf) => {
            const date = wf.created_at ? wf.created_at.split('T')[0] : '';
            if (date) acc[date] = (acc[date] || 0) + 1;
            return acc;
          }, {});

          const chartData = last7Days.map(date => activityMap[date] || 0);
          setActivityData(chartData);

          setStats([
            { name: 'Total Workflows', value: wfs.length.toString(), icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { name: 'Processed Docs', value: totalDocs.toString(), icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
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
        // Refresh
        const wfs = await api.getWorkflows();
        setWorkflows(wfs);
        setStats(prev => [
          { ...prev[0], value: wfs.length.toString() },
          prev[1],
          prev[2]
        ]);
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
        {/* Main Graph Placeholder - Keeping static for now as no endpoint exists */}
        <div className="lg:col-span-2 bg-background-card p-8 rounded-3xl border border-border shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text-primary">Processing Activity</h3>
            <select className="bg-background-subtle border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary outline-none focus:border-accent-blue transition-all">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-2 px-4">
            {activityData.map((val, i) => {
              // Handle scaling - if max value > 0, scale relative to 100%, else 0
              const max = Math.max(...activityData, 1);
              const height = (val / max) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-accent-blue/10 rounded-t-lg group-hover:bg-accent-blue/20 transition-all relative overflow-hidden" style={{ height: `${Math.max(height, 5)}%` }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="absolute bottom-0 left-0 right-0 bg-accent-blue rounded-t-lg"
                    />
                    {/* Tooltip for Value */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-text-secondary">Day {i + 1}</span>
                </div>
              )
            })}
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

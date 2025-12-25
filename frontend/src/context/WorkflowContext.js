'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

const WorkflowContext = createContext();

export function WorkflowProvider({ children }) {
    const { user } = useAuth();
    const [workflows, setWorkflows] = useState([]);
    const [activeWorkflowId, setActiveWorkflowId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchWorkflows() {
            if (user) {
                setLoading(true);
                try {
                    const wfs = await api.getWorkflows();
                    setWorkflows(wfs);
                    // If no active workflow is selected, pick the first one
                    if (wfs.length > 0 && !activeWorkflowId) {
                        setActiveWorkflowId(wfs[0].id);
                    }
                } catch (e) {
                    console.error("Failed to load workflows in context", e);
                } finally {
                    setLoading(false);
                }
            } else {
                setWorkflows([]);
                setActiveWorkflowId(null);
            }
        }
        fetchWorkflows();
    }, [user]);

    const refreshWorkflows = async () => {
        if (user) {
            try {
                const wfs = await api.getWorkflows();
                setWorkflows(wfs);
                return wfs;
            } catch (e) {
                console.error("Failed to refresh workflows", e);
            }
        }
    };

    return (
        <WorkflowContext.Provider value={{
            workflows,
            activeWorkflowId,
            setActiveWorkflowId,
            loading,
            refreshWorkflows
        }}>
            {children}
        </WorkflowContext.Provider>
    );
}

export function useWorkflow() {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
}

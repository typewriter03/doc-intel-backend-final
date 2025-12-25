'use client';

import { AuthProvider } from '../context/AuthContext';
import { WorkflowProvider } from '../context/WorkflowContext';

export function Providers({ children }) {
    return (
        <AuthProvider>
            <WorkflowProvider>
                {children}
            </WorkflowProvider>
        </AuthProvider>
    );
}

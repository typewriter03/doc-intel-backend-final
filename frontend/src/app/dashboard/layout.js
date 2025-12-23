'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Zap },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Audits', href: '/dashboard/audits', icon: ShieldCheck },
  { name: 'Utilities', href: '/dashboard/utilities', icon: Wrench },
];

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Placeholder for actual logout logic (e.g., Firebase sign out)
    router.push('/');
  };

  const handleSettings = () => {
    // Placeholder for settings page navigation
    alert('Settings page is not yet implemented.');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '80px' : '280px' }}
        className="relative bg-background-card border-r border-border flex flex-col transition-all duration-300 z-50"
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl text-text-primary whitespace-nowrap"
              >
                NiyamR Flow
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-accent-blue text-white shadow-soft'
                  : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
                  }`}
              >
                <link.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-accent-blue'}`} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {link.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border space-y-1">
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:bg-background-subtle transition-all">
            <Settings className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-background-card border border-border rounded-full flex items-center justify-center shadow-soft hover:bg-background-subtle transition-all z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-subtle relative overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-background-card/50 backdrop-blur-md border-b border-border flex items-center justify-between px-8 z-40">
          <div>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Dashboard</h2>
            <p className="text-lg font-bold text-text-primary capitalize">
              {pathname.split('/').pop().replace(/-/g, ' ') || 'Overview'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-bold text-green-500">API Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-background-subtle border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent-blue transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NiyamR" alt="User" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}


import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  isSyncing: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, activeView, setActiveView, isSyncing, children }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { id: 'pos', label: 'POS Terminal', icon: '💻', roles: [UserRole.CASHIER, UserRole.ADMIN, UserRole.MANAGER] },
    { id: 'inventory', label: 'Inventory', icon: '📦', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { id: 'reports', label: 'Reports', icon: '📝', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { id: 'settings', label: 'Cloud Settings', icon: '⚙️', roles: [UserRole.ADMIN] },
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <span className="text-blue-500">CLOUD</span>POS
          </h1>
          <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{user.role}</p>
            <p className="text-xs text-slate-300 mt-0.5 truncate">{user.branchId || 'HEADQUARTERS'}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-4">
          {allowedItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 font-medium ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
              {user.name[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-left flex items-center gap-2 border border-red-900/20"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 capitalize tracking-tight">
              {activeView.replace('-', ' ')}
            </h2>
            {isSyncing && (
              <span className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Database Connected</span>
             </div>
             <div className="h-4 w-px bg-slate-200"></div>
             <button className="text-slate-400 hover:text-slate-600 transition-colors">
                🔔
             </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

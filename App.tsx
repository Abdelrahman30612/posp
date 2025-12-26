
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POSTerminal from './components/POSTerminal';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import { useStore } from './store';
import { UserRole, Branch } from './types';
import { SQL_SCHEMA, ERD_DIAGRAM } from './dbSchema';

const App: React.FC = () => {
  const { db, currentUser, isSyncing, isProduction, login, logout, addSale, updateStock, addProduct, deleteProduct, addBranch, deleteBranch } = useStore();
  const [emailInput, setEmailInput] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [showDevInfo, setShowDevInfo] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/50">💻</div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">CloudPOS</h1>
            <p className="text-slate-500 mt-2 font-medium">Enterprise Multi-Branch Gateway</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Branch Staff Email</label>
              <input
                type="email"
                placeholder="staff@branch.com"
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-slate-50/50 font-medium"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <button
              disabled={isSyncing}
              onClick={async () => {
                const success = await login(emailInput);
                if (!success) alert("Credentials not found in cloud DB! Check Settings for demo logins.");
              }}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50"
            >
              {isSyncing ? 'Connecting to Cloud...' : 'Enter System'}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Node:</p>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => setEmailInput('admin@cloudpos.com')} className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-xl transition-all border border-slate-100">Admin Panel (HQ)</button>
              <button onClick={() => setEmailInput('john@cloudpos.com')} className="text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 py-3 rounded-xl transition-all border border-slate-100">Branch Terminal (B1)</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    const newBranch: Branch = {
      id: `b-${Math.random().toString(36).substr(2, 6)}`,
      name: branchName,
      location: branchLocation
    };
    await addBranch(newBranch);
    setBranchName('');
    setBranchLocation('');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard sales={db.sales} branches={db.branches} stocks={db.stock} products={db.products} />;
      case 'pos':
        return (
          <POSTerminal 
            products={db.products} 
            categories={db.categories} 
            stocks={db.stock}
            currentUser={currentUser}
            onCompleteSale={addSale}
          />
        );
      case 'inventory':
        return (
          <Inventory 
            products={db.products} 
            stocks={db.stock} 
            branches={db.branches} 
            categories={db.categories}
            updateStock={updateStock}
            addProduct={addProduct}
            deleteProduct={deleteProduct}
            isAdmin={currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.MANAGER}
          />
        );
      case 'reports':
        return <Reports sales={db.sales} branches={db.branches} users={db.users} />;
      case 'settings':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tighter mb-2">Cloud Infrastructure Control</h2>
                <div className="flex items-center gap-4">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isProduction ? 'bg-green-400 text-green-950' : 'bg-amber-400 text-amber-950'}`}>
                    {isProduction ? '● Live Production' : '● Simulation Mode (Local)'}
                   </span>
                   <p className="opacity-80 text-sm">Server: {isProduction ? 'CONNECTED' : 'STANDALONE'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeployGuide(!showDeployGuide)}
                  className="bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
                >
                  {showDeployGuide ? 'Close Deployment Guide' : 'How to Upload to Render?'}
                </button>
              </div>
            </div>

            {showDeployGuide && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-300">
                <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl mb-4 flex items-center justify-center font-bold">1</div>
                  <h4 className="font-bold mb-2">Create GitHub Repo</h4>
                  <p className="text-xs text-blue-200 leading-relaxed mb-4">Go to GitHub.com, create a repo named `pos-api`. Upload your `index.js` and `package.json` there.</p>
                  <div className="bg-black/20 p-3 rounded-lg font-mono text-[10px] text-blue-300">
                    git init<br/>git add .<br/>git commit -m "initial"<br/>git push
                  </div>
                </div>
                <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl mb-4 flex items-center justify-center font-bold">2</div>
                  <h4 className="font-bold mb-2">Connect to Render</h4>
                  <p className="text-xs text-indigo-200 leading-relaxed">Login to Render.com, select "New Web Service", and link it to your GitHub repo. It will detect Node.js automatically.</p>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                  <div className="w-10 h-10 bg-green-500 rounded-xl mb-4 flex items-center justify-center font-bold">3</div>
                  <h4 className="font-bold mb-2">Add Database Key</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">In Render dashboard, go to "Environment" and add `DATABASE_URL` with your Supabase link.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">🎯</span>
                      Production Launch Checklist
                    </h3>
                    <div className="space-y-6">
                       {[
                         { step: 1, title: 'Database Setup', desc: 'Create a PostgreSQL database on Supabase.', done: true },
                         { step: 2, title: 'GitHub Push', desc: 'Upload index.js and package.json to GitHub.', done: false },
                         { step: 3, title: 'Render Link', desc: 'Connect Render.com to your GitHub repo.', done: false },
                         { step: 4, title: 'Environment Config', desc: 'Add DATABASE_URL to Render settings.', done: false }
                       ].map(s => (
                         <div key={s.step} className="flex gap-4 group">
                           <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black transition-all ${s.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                             {s.done ? '✓' : s.step}
                           </div>
                           <div className="flex-1 border-b border-slate-50 pb-4">
                             <h4 className="font-bold text-slate-800">{s.title}</h4>
                             <p className="text-sm text-slate-500">{s.desc}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                       <h3 className="text-lg font-bold text-slate-800">Branch Management</h3>
                    </div>
                    <div className="p-6">
                      <form onSubmit={handleAddBranch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <input type="text" placeholder="Branch Name" className="px-4 py-3 rounded-xl border border-slate-200" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
                        <input type="text" placeholder="Location" className="px-4 py-3 rounded-xl border border-slate-200" value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} />
                        <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-xl">+ Add Branch</button>
                      </form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {db.branches.map(b => (
                          <div key={b.id} className="p-4 border border-slate-200 rounded-2xl bg-white flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">🏢</div>
                              <div className="font-bold text-slate-900">{b.name}</div>
                            </div>
                            <button onClick={() => deleteBranch(b.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all">🗑️</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                    <h3 className="text-xl font-bold mb-6">Database Export</h3>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">Download your current simulated data to seed your real cloud database.</p>
                    <button onClick={() => {
                      const data = JSON.stringify(db, null, 2);
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'cloudpos-backup.json';
                      a.click();
                    }} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">
                      EXPORT JSON BACKUP
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowDevInfo(!showDevInfo)}
                    className="w-full bg-white border border-slate-200 py-4 rounded-3xl font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    {showDevInfo ? 'Hide Technical Docs' : 'View API Source Code'}
                  </button>
               </div>
            </div>

            {showDevInfo && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full animate-in zoom-in duration-300">
                <div className="bg-slate-900 text-blue-400 p-8 rounded-3xl border border-slate-800 shadow-2xl overflow-auto max-h-[600px] font-mono text-[11px] leading-relaxed">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    server/index.js (Real Node.js Server)
                  </h4>
                  {`// 1. Install dependencies: npm install express pg cors body-parser
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 2. Connect to your Cloud DB (Supabase/Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 3. API Endpoints
app.post('/api/login', async (req, res) => {
  const { email } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length > 0) res.json({ user: result.rows[0] });
  else res.status(401).send('Unauthorized');
});

app.post('/api/sales', async (req, res) => {
  const sale = req.body;
  // Start Transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertSale = 'INSERT INTO sales (id, branch_id, total) VALUES ($1, $2, $3)';
    await client.query(insertSale, [sale.id, sale.branchId, sale.totalAmount]);
    // Loop through items and update stock...
    await client.query('COMMIT');
    res.status(201).send('Sale Recorded');
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).send(e.message);
  } finally {
    client.release();
  }
});

app.listen(3000, () => console.log('Server Live on Port 3000'));`}
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-auto max-h-[600px]">
                  <h4 className="text-slate-900 font-bold mb-4">Production SQL Schema</h4>
                  <pre className="text-[10px] leading-relaxed font-mono text-slate-600">{SQL_SCHEMA}</pre>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div>View under construction...</div>;
    }
  };

  return (
    <Layout 
      user={currentUser} 
      onLogout={logout} 
      activeView={activeView} 
      setActiveView={setActiveView}
      isSyncing={isSyncing}
    >
      {renderView()}
    </Layout>
  );
};

export default App;

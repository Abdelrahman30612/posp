
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { Sale, Branch, Stock, Product } from '../types';

interface DashboardProps {
  sales: Sale[];
  branches: Branch[];
  stocks: Stock[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, branches, stocks, products }) => {
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);
  const totalSalesCount = sales.length;
  const lowStockCount = stocks.filter(s => s.quantity < 5).length;

  // Process data for charts
  const salesByBranch = branches.map(b => ({
    name: b.name,
    total: sales.filter(s => s.branchId === b.id).reduce((acc, s) => acc + s.totalAmount, 0)
  }));

  const salesTrend = sales.slice(-10).reverse().map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: s.totalAmount
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Sales Count</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalSalesCount}</p>
          <p className="text-xs text-blue-600 mt-2">Active processing</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockCount}</p>
          <p className="text-xs text-slate-400 mt-2">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Active Branches</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{branches.length}</p>
          <p className="text-xs text-slate-400 mt-2">Centralized cloud sync</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Recent Sales Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Revenue by Branch</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBranch}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {salesByBranch.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

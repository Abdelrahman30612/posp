
import React, { useState } from 'react';
import { Sale, Branch, User } from '../types';

interface ReportsProps {
  sales: Sale[];
  branches: Branch[];
  users: User[];
}

const Reports: React.FC<ReportsProps> = ({ sales, branches, users }) => {
  const [filterBranch, setFilterBranch] = useState('all');

  const filteredSales = filterBranch === 'all' 
    ? sales 
    : sales.filter(s => s.branchId === filterBranch);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-sm text-slate-500">Detailed logs of all transactions across the cloud</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Branch</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Cashier</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Date/Time</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Items</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Method</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.map(sale => {
              const branchName = branches.find(b => b.id === sale.branchId)?.name || 'Unknown';
              const cashierName = users.find(u => u.id === sale.cashierId)?.name || 'Unknown';
              return (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors text-sm">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{sale.id}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{branchName}</td>
                  <td className="px-6 py-4 text-slate-600">{cashierName}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(sale.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">{sale.items.length}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sale.paymentMethod === 'CARD' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${sale.totalAmount.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredSales.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No transactions found for the selected period.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

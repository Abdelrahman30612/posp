
import React, { useState } from 'react';
import { Product, Stock, Branch, Category } from '../types';

interface InventoryProps {
  products: Product[];
  stocks: Stock[];
  branches: Branch[];
  categories: Category[];
  updateStock: (pid: string, bid: string, qty: number) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  isAdmin: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ products, stocks, branches, categories, updateStock, addProduct, deleteProduct, isAdmin }) => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: '',
    categoryId: categories[0]?.id || '',
    imageUrl: ''
  });

  const getStock = (productId: string) => {
    return stocks.find(s => s.productId === productId && s.branchId === selectedBranch)?.quantity || 0;
  };

  const handleStockChange = (productId: string, newQty: string) => {
    const qty = parseInt(newQty);
    if (!isNaN(qty)) {
      updateStock(productId, selectedBranch, qty);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      name: newProduct.name,
      sku: newProduct.sku,
      price: parseFloat(newProduct.price),
      categoryId: newProduct.categoryId,
      imageUrl: newProduct.imageUrl || `https://picsum.photos/seed/${newProduct.sku}/200`
    };
    addProduct(product);
    setIsModalOpen(false);
    setNewProduct({ name: '', sku: '', price: '', categoryId: categories[0]?.id || '', imageUrl: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Central Inventory</h2>
          <p className="text-sm text-slate-500">Manage stock levels across all branches</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add New Product
            </button>
          )}
          <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <label className="text-sm font-medium text-slate-600">Switch Branch View:</label>
          <select 
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Product</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">SKU</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Base Price</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Stock ({branches.find(b => b.id === selectedBranch)?.name})</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
              {isAdmin && <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => {
              const qty = getStock(product.id);
              const category = categories.find(c => c.id === product.categoryId)?.name;
              const status = qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'In Stock';
              const statusColor = qty === 0 ? 'bg-red-100 text-red-600' : qty < 10 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600';

              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-semibold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{product.sku}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{category}</td>
                  <td className="px-6 py-4 text-slate-900 font-bold">${product.price}</td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="0"
                          value={qty}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center bg-slate-50 group-hover:bg-white"
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-lg">{qty}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-slate-500 font-medium">No products found. Start by adding one!</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Product Name</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g. Wireless Keyboard"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">SKU / Barcode</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                    placeholder="WKB-101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold text-blue-600"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="29.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
                  value={newProduct.categoryId}
                  onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Image URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/30"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

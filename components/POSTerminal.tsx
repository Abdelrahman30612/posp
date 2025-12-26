
import React, { useState, useMemo } from 'react';
import { Product, Category, Sale, SaleItem, User, Stock } from '../types';

interface POSProps {
  products: Product[];
  categories: Category[];
  stocks: Stock[];
  currentUser: User;
  onCompleteSale: (sale: Sale) => void;
}

const POSTerminal: React.FC<POSProps> = ({ products, categories, stocks, currentUser, onCompleteSale }) => {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm);
      const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    const stock = stocks.find(s => s.productId === product.id && s.branchId === currentUser.branchId);
    const inCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
    
    if (!stock || (stock.quantity - inCart) <= 0) {
      alert("عفواً، الكمية غير كافية في المخزن!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const stock = stocks.find(s => s.productId === productId && s.branchId === currentUser.branchId);
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && stock && newQty > stock.quantity) {
          alert("لا توجد كمية كافية!");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const saleId = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const sale: Sale = {
      id: saleId,
      branchId: currentUser.branchId!,
      cashierId: currentUser.id,
      totalAmount: total,
      paymentMethod,
      timestamp: new Date().toISOString(),
      items: cart.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        saleId,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.product.price * item.quantity,
      }))
    };

    onCompleteSale(sale);
    setLastSale(sale);
    setCart([]);
  };

  return (
    <div className="flex gap-8 h-full max-h-[85vh] relative">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4">
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all font-medium ${
                selectedCategory === null ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-50/30">
          {filteredProducts.map(product => {
            const stock = stocks.find(s => s.productId === product.id && s.branchId === currentUser.branchId);
            const inCart = cart.find(item => item.product.id === product.id)?.quantity || 0;
            const availableQty = (stock?.quantity || 0) - inCart;
            const isOutOfStock = availableQty <= 0;
            
            return (
              <div 
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`group bg-white border border-slate-200 rounded-xl p-3 cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg relative ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {inCart > 0 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      {inCart}
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 truncate text-sm">{product.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-blue-600 font-black text-lg">${product.price}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {availableQty} Available
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-[400px] flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="font-bold">Active Cart</h3>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{cart.length} items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl">🛍️</div>
              <p className="font-medium">No items in cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-4 p-3 rounded-lg border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-500 font-mono">${item.product.price} x {item.quantity}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 hover:bg-slate-100 text-slate-600">-</button>
                      <span className="px-3 py-1 font-bold text-sm border-x border-slate-100">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 hover:bg-slate-100 text-slate-600">+</button>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between items-end">
                  <p className="font-black text-slate-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900 text-white">
          <div className="space-y-2 mb-6 opacity-80 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included)</span>
              <span>$0.00</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-800">
            <span className="text-lg font-medium">Grand Total</span>
            <span className="text-3xl font-black text-blue-400">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-2 mb-4 bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${paymentMethod === 'CASH' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              CASH 💵
            </button>
            <button 
              onClick={() => setPaymentMethod('CARD')}
              className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${paymentMethod === 'CARD' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              CARD 💳
            </button>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-5 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-500 active:scale-[0.98] transition-all disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-xl shadow-blue-900/20"
          >
            COMPLETE TRANSACTION
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-green-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h4 className="text-xl font-bold">Sale Successful!</h4>
              <p className="text-green-100 text-sm opacity-80 mt-1">Order #{lastSale.id}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="font-mono text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date:</span>
                  <span>{new Date(lastSale.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Method:</span>
                  <span>{lastSale.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">
                {lastSale.items.map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.quantity}x {p?.name}</span>
                      <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Total Amount</span>
                <span className="text-2xl font-black text-slate-900">${lastSale.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setLastSale(null)}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  New Sale
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  🖨️
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Powered by CloudPOS Cloud Sync Engine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSTerminal;

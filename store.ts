
import { useState, useEffect } from 'react';
import { 
  User, Sale, Stock, Product, Branch, Category, UserRole 
} from './types';
import { USERS, BRANCHES, CATEGORIES, PRODUCTS, INITIAL_STOCK } from './constants';

const DB_KEY = 'cloudpos_database';

// --- PRODUCTION CONFIGURATION ---
// Change this to 'true' when you have a real Node.js server running
const IS_PRODUCTION = false; 
const API_BASE_URL = 'https://your-api-on-render.com/api'; 
// --------------------------------

interface DBState {
  users: User[];
  branches: Branch[];
  categories: Category[];
  products: Product[];
  stock: Stock[];
  sales: Sale[];
}

const getInitialDB = (): DBState => {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) return JSON.parse(saved);
  return {
    users: USERS,
    branches: BRANCHES,
    categories: CATEGORIES,
    products: PRODUCTS,
    stock: INITIAL_STOCK,
    sales: [],
  };
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const useStore = () => {
  const [db, setDb] = useState<DBState>(getInitialDB());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }, [db]);

  const login = async (email: string) => {
    setIsSyncing(true);
    if (IS_PRODUCTION) {
      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        setCurrentUser(data.user);
        return true;
      } catch (e) {
        console.error("Cloud Auth Failed", e);
        return false;
      } finally {
        setIsSyncing(false);
      }
    } else {
      await delay(800);
      const user = db.users.find(u => u.email === email);
      if (user) setCurrentUser(user);
      setIsSyncing(false);
      return !!user;
    }
  };

  const logout = () => setCurrentUser(null);

  const addSale = async (sale: Sale) => {
    setIsSyncing(true);
    if (IS_PRODUCTION) {
      await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale)
      });
      // Optionally re-fetch DB here
    } else {
      await delay(1200);
      setDb(prev => {
        const newStock = [...prev.stock];
        sale.items.forEach(item => {
          const stockIdx = newStock.findIndex(
            s => s.productId === item.productId && s.branchId === sale.branchId
          );
          if (stockIdx > -1) {
            newStock[stockIdx].quantity -= item.quantity;
          }
        });
        return {
          ...prev,
          sales: [sale, ...prev.sales],
          stock: newStock
        };
      });
    }
    setIsSyncing(false);
  };

  const updateStock = async (productId: string, branchId: string, quantity: number) => {
    setIsSyncing(true);
    await delay(500);
    setDb(prev => {
      const newStock = [...prev.stock];
      const idx = newStock.findIndex(s => s.productId === productId && s.branchId === branchId);
      if (idx > -1) {
        newStock[idx].quantity = quantity;
      } else {
        newStock.push({ productId, branchId, quantity });
      }
      return { ...prev, stock: newStock };
    });
    setIsSyncing(false);
  };

  const addProduct = async (product: Product) => {
    setIsSyncing(true);
    await delay(1000);
    setDb(prev => ({ ...prev, products: [...prev.products, product] }));
    setIsSyncing(false);
  };

  const deleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setIsSyncing(true);
    await delay(800);
    setDb(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId),
      stock: prev.stock.filter(s => s.productId !== productId)
    }));
    setIsSyncing(false);
  };

  const addBranch = async (branch: Branch) => {
    setIsSyncing(true);
    await delay(1000);
    setDb(prev => ({ ...prev, branches: [...prev.branches, branch] }));
    setIsSyncing(false);
  };

  const deleteBranch = async (branchId: string) => {
    const hasUsers = db.users.some(u => u.branchId === branchId);
    if (hasUsers) {
      alert("Cannot delete: Active users assigned.");
      return;
    }
    setIsSyncing(true);
    await delay(1000);
    setDb(prev => ({
      ...prev,
      branches: prev.branches.filter(b => b.id !== branchId),
      stock: prev.stock.filter(s => s.branchId !== branchId)
    }));
    setIsSyncing(false);
  };

  return {
    db,
    currentUser,
    isSyncing,
    isProduction: IS_PRODUCTION,
    login,
    logout,
    addSale,
    updateStock,
    addProduct,
    deleteProduct,
    addBranch,
    deleteBranch
  };
};


export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER'
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string | null; // Admin has null
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  imageUrl?: string;
}

export interface Stock {
  productId: string;
  branchId: string;
  quantity: number;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  branchId: string;
  cashierId: string;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD';
  timestamp: string;
  items: SaleItem[];
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  topProducts: { name: string; sales: number }[];
  salesByBranch: { branchName: string; total: number }[];
}

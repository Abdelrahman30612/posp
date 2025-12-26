
import React from 'react';
import { Branch, User, UserRole, Category, Product, Stock } from './types';

export const BRANCHES: Branch[] = [
  { id: 'b1', name: 'Downtown Branch', location: '123 Main St' },
  { id: 'b2', name: 'Westside Mall', location: '456 Shopping Blvd' },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@cloudpos.com', role: UserRole.ADMIN, branchId: null },
  { id: 'u2', name: 'John Manager', email: 'john@cloudpos.com', role: UserRole.MANAGER, branchId: 'b1' },
  { id: 'u3', name: 'Alice Cashier', email: 'alice@cloudpos.com', role: UserRole.CASHIER, branchId: 'b1' },
  { id: 'u4', name: 'Bob Cashier', email: 'bob@cloudpos.com', role: UserRole.CASHIER, branchId: 'b2' },
];

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'Electronics' },
  { id: 'c2', name: 'Apparel' },
  { id: 'c3', name: 'Home & Kitchen' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Laptop Pro X', sku: 'LAP-001', categoryId: 'c1', price: 1200, imageUrl: 'https://picsum.photos/seed/laptop/200' },
  { id: 'p2', name: 'Wireless Mouse', sku: 'MOU-002', categoryId: 'c1', price: 45, imageUrl: 'https://picsum.photos/seed/mouse/200' },
  { id: 'p3', name: 'Cotton T-Shirt', sku: 'TSH-003', categoryId: 'c2', price: 25, imageUrl: 'https://picsum.photos/seed/shirt/200' },
  { id: 'p4', name: 'Coffee Maker', sku: 'COF-004', categoryId: 'c3', price: 89, imageUrl: 'https://picsum.photos/seed/coffee/200' },
];

export const INITIAL_STOCK: Stock[] = [
  { productId: 'p1', branchId: 'b1', quantity: 10 },
  { productId: 'p2', branchId: 'b1', quantity: 50 },
  { productId: 'p1', branchId: 'b2', quantity: 5 },
  { productId: 'p4', branchId: 'b2', quantity: 12 },
];

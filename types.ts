
export enum Role {
  Manager = 'Manager',
  Staff = 'Staff',
}

export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role: Role;
}

export interface SaleItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  date: string; // ISO date string
  staffId: string;
  staffEmail: string;
  customerName: string;
  customerPhone?: string;
  paymentMethod: 'Cash' | 'Card' | 'Online';
}
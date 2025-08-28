
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Role, Sale, SaleItem } from '../types';

// --- LocalStorage Hook ---
export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


// --- App Context Interfaces ---
interface IAuthContext {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
}

interface ISalesContext {
  sales: Sale[];
  addSale: (items: SaleItem[], customerName: string, customerPhone: string, paymentMethod: 'Cash' | 'Card' | 'Online') => void;
  importSales: (newSales: Sale[]) => void;
  exportSales: () => string;
}

// --- Context Creation ---
const AppContext = createContext<IAuthContext & ISalesContext | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);

  const isAuthenticated = !!currentUser;

  const signup = useCallback((email: string, password: string, role: Role): boolean => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      alert('User with this email already exists.');
      return false;
    }
    const newUser: User = { id: Date.now().toString(), email, password, role };
    setUsers(prevUsers => [...prevUsers, newUser]);
    setCurrentUser(newUser);
    return true;
  }, [users, setUsers, setCurrentUser]);

  const login = useCallback((email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    alert('Invalid email or password.');
    return false;
  }, [users, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const addSale = useCallback((items: SaleItem[], customerName: string, customerPhone: string, paymentMethod: 'Cash' | 'Card' | 'Online') => {
    if (!currentUser || items.length === 0) return;
    
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      items,
      totalAmount,
      date: new Date().toISOString(),
      staffId: currentUser.id,
      staffEmail: currentUser.email,
      customerName,
      customerPhone,
      paymentMethod,
    };
    setSales(prevSales => [...prevSales, newSale]);
  }, [currentUser, setSales]);
  
  const importSales = useCallback((newSales: Sale[]) => {
      // Basic validation for new fields
      if (!Array.isArray(newSales) || newSales.some(s => !s.id || !s.items || s.totalAmount == null || !s.customerName || !s.paymentMethod)) {
          alert("Invalid CSV file format. Make sure customerName and paymentMethod fields are included.");
          return;
      }
      setSales(prevSales => [...prevSales, ...newSales]);
      alert("Sales data imported successfully!");
  }, [setSales]);

  const exportSales = useCallback(() => {
    if (sales.length === 0) return '';
    const header = ['id', 'items', 'totalAmount', 'date', 'staffId', 'staffEmail', 'customerName', 'customerPhone', 'paymentMethod'].join(',');
    const rows = sales.map(sale => {
        // To prevent commas in JSON from breaking CSV, wrap in quotes and escape internal quotes.
        const itemsJson = `"${JSON.stringify(sale.items).replace(/"/g, '""')}"`;
        return [sale.id, itemsJson, sale.totalAmount, sale.date, sale.staffId, sale.staffEmail, sale.customerName, sale.customerPhone || '', sale.paymentMethod].join(',');
    });
    return [header, ...rows].join('\n');
}, [sales]);

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
    sales,
    addSale,
    importSales,
    exportSales,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hooks ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
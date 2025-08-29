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
type Theme = 'light' | 'dark';

interface IThemeContext {
  theme: Theme;
  toggleTheme: () => void;
}

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

interface IPwaContext {
  installPrompt: any;
  isOnline: boolean;
  handleInstallClick: () => void;
  isInstallModalVisible: boolean;
  dismissInstallModal: () => void;
}

// --- Context Creation ---
const AppContext = createContext<IAuthContext & ISalesContext & IThemeContext & IPwaContext | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallModalVisible, setIsInstallModalVisible] = useState(false);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

    // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const promptShown = sessionStorage.getItem('pwaInstallPromptShown');

      if (!isStandalone && !promptShown) {
        setTimeout(() => {
            setIsInstallModalVisible(true);
        }, 3000); // Show after 3 seconds
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallModalVisible(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setInstallPrompt(null);
            setIsInstallModalVisible(false);
        });
    }
  };

  const dismissInstallModal = () => {
      setIsInstallModalVisible(false);
      sessionStorage.setItem('pwaInstallPromptShown', 'true');
  };

  // Online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

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
    theme,
    toggleTheme,
    installPrompt,
    isOnline,
    handleInstallClick,
    isInstallModalVisible,
    dismissInstallModal,
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
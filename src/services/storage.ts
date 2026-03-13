import { Product, Order, User, SiteSettings } from '../types';

const PRODUCTS_KEY = 'mango_market_products';
const ORDERS_KEY = 'mango_market_orders';
const USERS_KEY = 'mango_market_users';
const SETTINGS_KEY = 'mango_market_settings';

const defaultSettings: SiteSettings = {
  whatsapp: '01516595597',
  facebook: 'https://www.facebook.com/sorrow.is.not.stolen',
  email: 'bazaarihelp@gmail.com',
  heroTitle: 'AMAR SWAPNO COLLECTION.',
  heroSubtitle: 'Discover the finest products from the heart of Bangladesh. Handpicked for your dreams.',
  shopButtonText: 'Shop Collection',
  logoUrl: '',
  deliveryCharge: 60,
  deliveryChargeType: 'later',
  adminEmail: 'bazaarihelp@gmail.com',
  adminPassword: 'swapno2026'
};

export const storage = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveProduct: (product: Product) => {
    const products = storage.getProducts();
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  },
  deleteProduct: (id: string) => {
    const products = storage.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  },

  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveOrder: (order: Omit<Order, 'id'>) => {
    const orders = storage.getOrders();
    const newOrder = { ...order, id: Math.random().toString(36).substr(2, 9) };
    orders.push(newOrder as Order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  },
  updateOrderStatus: (id: string, status: Order['status']) => {
    const orders = storage.getOrders();
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveUser: (user: Omit<User, 'id' | 'customId'>) => {
    const users = storage.getUsers();
    
    // Generate sequential customId
    const lastUser = users.length > 0 ? users[users.length - 1] : null;
    let nextId = 1;
    if (lastUser && lastUser.customId) {
      nextId = parseInt(lastUser.customId) + 1;
    }
    const customId = nextId.toString().padStart(6, '0');

    const newUser = { 
      ...user, 
      id: Math.random().toString(36).substr(2, 9),
      customId,
      createdAt: new Date().toISOString()
    };
    users.push(newUser as User);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const users = storage.getUsers();
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return updated.find(u => u.id === id);
  },
  findUserByEmail: (email: string) => {
    return storage.getUsers().find(u => u.email === email);
  },
  findUserByCustomId: (customId: string) => {
    return storage.getUsers().find(u => u.customId === customId);
  },

  // Settings
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : defaultSettings;
  },
  updateSettings: (settings: SiteSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};

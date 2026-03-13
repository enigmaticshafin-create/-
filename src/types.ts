export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  deliveryChargeType: 'upfront' | 'later';
  status: 'Pending' | 'Approved' | 'Completed' | 'Delivered';
  createdAt: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  customId: string; // 000001, 000002...
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface SiteSettings {
  whatsapp: string;
  facebook: string;
  email: string;
  heroTitle: string;
  heroSubtitle: string;
  shopButtonText: string;
  logoUrl?: string;
  deliveryCharge: number;
  deliveryChargeType: 'upfront' | 'later';
  adminEmail: string;
  adminPassword: string;
}

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

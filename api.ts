import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  old_price: string | null;
  sku: string;
  stock: number;
  status: string;
  is_featured: boolean;
  is_new: boolean;
  category: number;
  category_name: string;
  discount_percentage: number;
  is_in_stock: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_main: boolean;
  order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: string | null;
  stock: number;
  color: string;
  size: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
}

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_type: string;
  delivery_city: string;
  delivery_address?: string;
  payment_type: string;
  comment?: string;
  total_amount: number;
  items: {
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
  }[];
}

export const api = {
  getProducts: async () => {
    const response = await axios.get(`${API_URL}/products/`);
    return response.data;
  },

  getProduct: async (id: number) => {
    const response = await axios.get(`${API_URL}/products/${id}/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await axios.get(`${API_URL}/categories/`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: number) => {
    const response = await axios.get(`${API_URL}/products/?category=${categoryId}`);
    return response.data;
  },

  searchProducts: async (query: string) => {
    const response = await axios.get(`${API_URL}/products/?search=${query}`);
    return response.data;
  },

  createOrder: async (orderData: OrderData) => {
    const response = await axios.post(`${API_URL}/orders/`, orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await axios.get(`${API_URL}/orders/`);
    return response.data;
  },

  getOrder: async (id: number) => {
    const response = await axios.get(`${API_URL}/orders/${id}/`);
    return response.data;
  },
};

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const tokens = localStorage.getItem('auth_tokens');
      if (tokens) {
        try {
          const parsedTokens = JSON.parse(tokens);
          if (parsedTokens.access) {
            config.headers.Authorization = `Bearer ${parsedTokens.access}`;
          }
        } catch (error) {
          console.error('Ошибка парсинга токена:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Токен истек или недействителен');
    }
    return Promise.reject(error);
  }
);

export const affiliateAPI = {
  getTiers: () => api.get('/affiliates/programs/'),
  register: (data: any) => api.post('/affiliates/list/register/', data),
  getDashboard: () => api.get('/affiliates/list/dashboard/'),
  getMe: () => api.get('/affiliates/list/me/'),
  getMaterials: () => api.get('/affiliates/materials/'),
  downloadMaterial: (id: number) => api.post(`/affiliates/materials/${id}/download/`),
  requestPayout: (amount: number) => api.post('/affiliates/list/request_payout/', { amount }),
};

export const deliveryAPI = {
  getMethods: async (orderAmount?: number): Promise<any[]> => {
    const url = orderAmount ? `/delivery-methods/?order_amount=${orderAmount}` : `/delivery-methods/`;
    const res = await api.get(url);
    const data = res.data;
    return Array.isArray(data) ? data : data.results || [];
  },
};

export const partnershipAPI = {
  // Заявки
  applyForPartnership: (data: {
    agreed_to_terms: boolean;
    youtube_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    telegram_url?: string;
    total_followers?: number;
    about?: string;
  }) => api.post('/partnership/applications/', data),

  getProfile: async () => {
    try {
      return await api.get('/partnership/profile/');
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  getChatHistory: () => api.get('/partnership/chat/'),
  chatSend: (text: string) => api.post('/partnership/chat/', { text }),
  chatMarkRead: () => api.post('/partnership/chat/read/'),

  chatUpload: (file: File, text = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);
    return api.post('/partnership/chat/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },


  getMyApplication: async () => {
    try {
      return await api.get('/partnership/applications/my_application/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Партнёр
  getPartnerProfile: async () => {
    try {
      return await api.get('/partnership/partners/me/');
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) return { data: null };
      throw error;
    }
  },

  getPartnerDashboard: async () => {
    try {
      return await api.get('/partnership/partners/dashboard/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Соцсети
  getSocialAccounts: async () => {
    try {
      return await api.get('/partnership/social-accounts/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  addSocialAccount: (data: any) => api.post('/partnership/social-accounts/', data),
  deleteSocialAccount: (id: number) => api.delete(`/partnership/social-accounts/${id}/`),

  // Аналитика
  getAnalytics: async (days = 30) => {
    try {
      return await api.get(`/partnership/analytics/?days=${days}`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Рефералы
  getReferrals: async () => {
    try {
      return await api.get('/partnership/referrals/');
    } catch (error: any) {
      if (error.response?.status === 404) return {
        data: { referrals: [], total_referrals: 0, total_earnings: 0, referral_code: '', referral_link: '', recent_rewards: [] }
      };
      throw error;
    }
  },

  // Запросы товаров
  getProductRequests: async () => {
    try {
      return await api.get('/partnership/product-requests/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  createProductRequest: (data: any) => api.post('/partnership/product-requests/', data),
  uploadContract: (requestId: number, file: File) => {
    const formData = new FormData();
    formData.append('contract_file', file);
    return api.post(`/partnership/product-requests/${requestId}/upload_contract/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Видео
  getVideos: async () => {
    try {
      return await api.get('/partnership/videos/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  uploadVideo: (data: any) => api.post('/partnership/videos/', data),
  deleteVideo: (id: number) => api.delete(`/partnership/videos/${id}/`),

  // Возвраты
  getRefunds: async () => {
    try {
      return await api.get('/partnership/refunds/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  createRefund: (data: any) => api.post('/partnership/refunds/', data),

  // Мои товары
  getMyProducts: async () => {
    try {
      return await api.get('/partnership/my-products/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },

  // ✅ Трекинг
  trackRefView: (ref_token: string) =>
    api.post('/partnership/track-ref-view/', { ref_token }),

  trackCartAdd: (ref_token: string) =>
    api.post('/partnership/track-cart-add/', { ref_token }),

  trackSkuSearch: (customSku: string) =>
    api.post('/partnership/track-sku-search/', { custom_sku: customSku }),

  trackPurchase: (refToken: string) =>
    api.post('/partnership/track-purchase/', { ref_token: refToken }),
};

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms/'),
  getMessages: (roomId: number) => api.get(`/chat/rooms/${roomId}/messages/`),
  sendMessage: (roomId: number, message: string) =>
    api.post(`/chat/rooms/${roomId}/messages/`, { message }),
  createRoom: (data: any) => api.post('/chat/rooms/', data),
};

export const notificationsAPI = {
  getAll: async () => {
    try {
      return await api.get('/notifications/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  getUnread: async () => {
    try {
      return await api.get('/notifications/unread/');
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  markAsRead: (id: number) => api.post(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark_all_read/'),
};

export const gamificationAPI = {
  getAchievements: () => api.get('/gamification/achievements/'),
  getBadges: () => api.get('/gamification/badges/'),
  getLeaderboard: () => api.get('/gamification/leaderboard/'),
};

export const productsAPI = {
  getProducts: (params?: any) => api.get('/products/', { params }),
  getProduct: (id: number) => api.get(`/products/${id}/`),
  getCategories: () => api.get('/categories/'),
};

export const addressAPI = {
  getAll: () => api.get('/addresses/'),
  create: (data: any) => api.post('/addresses/', data),
  update: (id: number, data: any) => api.patch(`/addresses/${id}/`, data),
  delete: (id: number) => api.delete(`/addresses/${id}/`),
  setDefault: (id: number) => api.post(`/addresses/${id}/set_default/`),
};
export const createChatWebSocket = (roomId: number) => {
  const token = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('auth_tokens') || '{}')?.access 
    : null;
  return new WebSocket(`${API_URL.replace(/^http/, 'ws')}chat/rooms/${roomId}/ws/`, 
    token ? [`Bearer ${token}`] : []);
};

export default api;

import axios from 'axios';

const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api';

const PRODUCTS_API = `${API_ROOT}/products`;
const PARTNERSHIP_API = `${API_ROOT}/partnership`;
const CHAT_API = `${API_ROOT}/chat`;
const NOTIFICATIONS_API = `${API_ROOT}/notifications`;

export const api = axios.create({
  baseURL: API_ROOT,
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
    const url = orderAmount
      ? `${PRODUCTS_API}/delivery-methods/?order_amount=${orderAmount}`
      : `${PRODUCTS_API}/delivery-methods/`;
    const res = await api.get(url);
    const data = res.data;
    return Array.isArray(data) ? data : data.results || [];
  },
};

export const partnershipAPI = {
  applyForPartnership: (data: any) =>
    api.post(`${PARTNERSHIP_API}/applications/`, data),

  getProfile: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/profile/`);
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  getChatHistory: () => api.get(`${PARTNERSHIP_API}/chat/`),
  chatSend: (text: string) => api.post(`${PARTNERSHIP_API}/chat/`, { text }),
  chatMarkRead: () => api.post(`${PARTNERSHIP_API}/chat/read/`),

  chatUpload: (file: File, text = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);
    return api.post(`${PARTNERSHIP_API}/chat/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMyApplication: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/applications/my_application/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Партнёр
  getPartnerProfile: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/partners/me/`);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) return { data: null };
      throw error;
    }
  },

  getPartnerDashboard: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/partners/dashboard/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Соцсети
  getSocialAccounts: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/social-accounts/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  addSocialAccount: (data: any) => api.post(`${PARTNERSHIP_API}/social-accounts/`, data),
  deleteSocialAccount: (id: number) => api.delete(`${PARTNERSHIP_API}/social-accounts/${id}/`),

  // Аналитика
  getAnalytics: async (days = 30) => {
    try {
      return await api.get(`${PARTNERSHIP_API}/analytics/?days=${days}`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Рефералы
  getReferrals: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/referrals/`);
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
      return await api.get(`${PARTNERSHIP_API}/product-requests/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  createProductRequest: (data: any) => api.post(`${PARTNERSHIP_API}/product-requests/`, data),
  uploadContract: (requestId: number, file: File) => {
    const formData = new FormData();
    formData.append('contract_file', file);
    return api.post(`${PARTNERSHIP_API}/product-requests/${requestId}/upload_contract/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Видео
  getVideos: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/videos/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  uploadVideo: (data: any) => api.post(`${PARTNERSHIP_API}/videos/`, data),
  deleteVideo: (id: number) => api.delete(`${PARTNERSHIP_API}/videos/${id}/`),

  // Возвраты
  getRefunds: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/refunds/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  createRefund: (data: any) => api.post(`${PARTNERSHIP_API}/refunds/`, data),

  // Мои товары
  getMyProducts: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/my-products/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },

  // ✅ Трекинг
  trackRefView: (ref_token: string) =>
    api.post(`${PARTNERSHIP_API}/track-ref-view/`, { ref_token }),

  trackCartAdd: (ref_token: string) =>
    api.post(`${PARTNERSHIP_API}/track-cart-add/`, { ref_token }),

  trackSkuSearch: (customSku: string) =>
    api.post(`${PARTNERSHIP_API}/track-sku-search/`, { custom_sku: customSku }),

  trackPurchase: (refToken: string) =>
    api.post(`${PARTNERSHIP_API}/track-purchase/`, { ref_token: refToken }),
};

export const chatAPI = {
  getRooms: () => api.get(`${CHAT_API}/rooms/`),
  getMessages: (roomId: number) => api.get(`${CHAT_API}/rooms/${roomId}/messages/`),
  sendMessage: (roomId: number, message: string) =>
    api.post(`${CHAT_API}/rooms/${roomId}/messages/`, { message }),
  createRoom: (data: any) => api.post(`${CHAT_API}/rooms/`, data),
};

export const notificationsAPI = {
  getAll: async () => {
    try {
      return await api.get(`${NOTIFICATIONS_API}/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  getUnread: async () => {
    try {
      return await api.get(`${NOTIFICATIONS_API}/unread/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },
  markAsRead: (id: number) => api.post(`${NOTIFICATIONS_API}/${id}/mark_as_read/`),
  markAllAsRead: () => api.post(`${NOTIFICATIONS_API}/mark_all_as_read/`),
};

export const gamificationAPI = {
  getAchievements: () => api.get('/gamification/achievements/'),
  getBadges: () => api.get('/gamification/badges/'),
  getLeaderboard: () => api.get('/gamification/leaderboard/'),
};

export const productsAPI = {
  getProducts: (params?: any) => api.get(`${PRODUCTS_API}/products/`, { params }),
  getProduct: (id: number) => api.get(`${PRODUCTS_API}/products/${id}/`),
  getCategories: () => api.get(`${PRODUCTS_API}/categories/`),
};

export const addressAPI = {
  getAll: () => api.get(`${PRODUCTS_API}/addresses/`),
  create: (data: any) => api.post(`${PRODUCTS_API}/addresses/`, data),
  update: (id: number, data: any) => api.patch(`${PRODUCTS_API}/addresses/${id}/`, data),
  delete: (id: number) => api.delete(`${PRODUCTS_API}/addresses/${id}/`),
};

export const createChatWebSocket = (roomId: number) => {
  const token =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('auth_tokens') || '{}')?.access
      : null;

  const wsBase = API_ROOT.replace(/^http/, 'ws').replace(/\/$/, '');

  return new WebSocket(
    `${wsBase}/chat/rooms/${roomId}/ws/`,
    token ? [`Bearer ${token}`] : []
  );
};

export default api;

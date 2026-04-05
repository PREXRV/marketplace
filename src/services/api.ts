import axios from 'axios';

const API_ROOT = 'https://fulfilling-success-production-3288.up.railway.app/api';

const PARTNERSHIP_API = `${API_ROOT}/partnerships`;
const CHAT_API = `${API_ROOT}/chat`;
const NOTIFICATIONS_API = `${API_ROOT}/notifications`;
const ORDERS_API = `${API_ROOT}/orders`;
const PRODUCTS_API = `${API_ROOT}/products`;

// ── Axios instance ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: API_ROOT,
  headers: { 'Content-Type': 'application/json' },
});

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const tokens = localStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens)?.access ?? null : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Токен истёк или недействителен');
    }
    return Promise.reject(error);
  }
);

// ── WebSocket factory ─────────────────────────────────────────────────────────

function getWsRoot(): string {
  const apiUrl = new URL(API_ROOT);
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${apiUrl.host}`;
}

export function createPartnerChatWS(partnerId: number): WebSocket {
  const token = getAccessToken();

  const url = token
    ? `${getWsRoot()}/ws/partner-chat/${partnerId}/?token=${encodeURIComponent(token)}`
    : `${getWsRoot()}/ws/partner-chat/${partnerId}/`;

  return new WebSocket(url);
}

export function createChatWebSocket(roomId: number, accessToken?: string): WebSocket {
  const token = accessToken || getAccessToken();

  const url = token
    ? `${getWsRoot()}/ws/chat/rooms/${roomId}/?token=${encodeURIComponent(token)}`
    : `${getWsRoot()}/ws/chat/rooms/${roomId}/`;

  return new WebSocket(url);
}

// ── Affiliates ────────────────────────────────────────────────────────────────

export const affiliateAPI = {
  getTiers: () => api.get('/affiliates/programs/'),
  register: (data: any) => api.post('/affiliates/list/register/', data),
  getDashboard: () => api.get('/affiliates/list/dashboard/'),
  getMe: () => api.get('/affiliates/list/me/'),
  getMaterials: () => api.get('/affiliates/materials/'),
  downloadMaterial: (id: number) => api.post(`/affiliates/materials/${id}/download/`),
  requestPayout: (amount: number) =>
    api.post('/affiliates/list/request_payout/', { amount }),
};

// ── Delivery ──────────────────────────────────────────────────────────────────

export const deliveryAPI = {
  getMethods: async (orderAmount?: number): Promise<any[]> => {
    const url = orderAmount
      ? `${ORDERS_API}/delivery-methods/?order_amount=${orderAmount}`
      : `${ORDERS_API}/delivery-methods/`;
    const res = await api.get(url);
    const data = res.data;
    return Array.isArray(data) ? data : data.results || [];
  },
};

// ── Partnership ───────────────────────────────────────────────────────────────

export const partnershipAPI = {
  applyForPartnership: (data: any) =>
    api.post(`${PARTNERSHIP_API}/applications/`, data),

  getProfile: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/profile/`);
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  getPartnerProfile: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/partners/me/`);
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        return { data: null };
      }
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

  getMyApplication: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/applications/my_application/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: null };
      throw error;
    }
  },

  // Чат партнёра
  getChatHistory: () => api.get(`${PARTNERSHIP_API}/chat/`),

  chatSend: (text: string) =>
    api.post(`${PARTNERSHIP_API}/chat/`, { text }),

  chatMarkRead: () =>
    api.post(`${PARTNERSHIP_API}/chat/read/`),

  chatUpload: (file: File, text = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (text) formData.append('text', text);

    return api.post(`${PARTNERSHIP_API}/chat/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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

  addSocialAccount: (data: any) =>
    api.post(`${PARTNERSHIP_API}/social-accounts/`, data),

  deleteSocialAccount: (id: number) =>
    api.delete(`${PARTNERSHIP_API}/social-accounts/${id}/`),

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
      if (error.response?.status === 404) {
        return {
          data: {
            referrals: [],
            total_referrals: 0,
            total_earnings: 0,
            referral_code: '',
            referral_link: '',
            recent_rewards: [],
          },
        };
      }
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

  createProductRequest: (data: any) =>
    api.post(`${PARTNERSHIP_API}/product-requests/`, data),

  uploadContract: (requestId: number, file: File) => {
    const formData = new FormData();
    formData.append('contract_file', file);
    return api.post(
      `${PARTNERSHIP_API}/product-requests/${requestId}/upload_contract/`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
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

  uploadVideo: (data: any) =>
    api.post(`${PARTNERSHIP_API}/videos/`, data),

  deleteVideo: (id: number) =>
    api.delete(`${PARTNERSHIP_API}/videos/${id}/`),

  // Возвраты
  getRefunds: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/refunds/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },

  createRefund: (data: any) =>
    api.post(`${PARTNERSHIP_API}/refunds/`, data),

  // Мои товары
  getMyProducts: async () => {
    try {
      return await api.get(`${PARTNERSHIP_API}/my-products/`);
    } catch (error: any) {
      if (error.response?.status === 404) return { data: [] };
      throw error;
    }
  },

  // Трекинг
  trackRefView: (ref_token: string) =>
    api.post(`${PARTNERSHIP_API}/track-ref-view/`, { ref_token }),

  trackCartAdd: (ref_token: string) =>
    api.post(`${PARTNERSHIP_API}/track-cart-add/`, { ref_token }),

  trackSkuSearch: (customSku: string) =>
    api.post(`${PARTNERSHIP_API}/track-sku-search/`, { custom_sku: customSku }),

  trackPurchase: (refToken: string) =>
    api.post(`${PARTNERSHIP_API}/track-purchase/`, { ref_token: refToken }),
};

// ── Chat (general rooms) ──────────────────────────────────────────────────────

export const chatAPI = {
  getRooms: () =>
    api.get(`${CHAT_API}/rooms/`),

  getMessages: (roomId: number) =>
    api.get(`${CHAT_API}/rooms/${roomId}/messages/`),

  sendMessage: (roomId: number, message: string) =>
    api.post(`${CHAT_API}/rooms/${roomId}/messages/`, { message }),

  createRoom: (data: any) =>
    api.post(`${CHAT_API}/rooms/`, data),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsAPI = {
  getAll: async () => {
    try {
      return await api.get(`${NOTIFICATIONS_API}/`);
    } catch (e: any) {
      if (e.response?.status === 404) return { data: [] };
      throw e;
    }
  },

  getUnread: async () => {
    try {
      return await api.get(`${NOTIFICATIONS_API}/unread/`);
    } catch (e: any) {
      if (e.response?.status === 404) return { data: [] };
      throw e;
    }
  },

  markAsRead: (id: number) =>
    api.post(`${NOTIFICATIONS_API}/${id}/mark_as_read/`),

  markAllAsRead: () =>
    api.post(`${NOTIFICATIONS_API}/mark_all_as_read/`),
};

// ── Gamification ──────────────────────────────────────────────────────────────

export const gamificationAPI = {
  getAchievements: () => api.get('/gamification/achievements/'),
  getBadges: () => api.get('/gamification/badges/'),
  getLeaderboard: () => api.get('/gamification/leaderboard/'),
};

// ── Products ──────────────────────────────────────────────────────────────────

export const productsAPI = {
  getProducts: (params?: any) =>
    api.get(`${PRODUCTS_API}/products/`, { params }),

  getProduct: (id: number) =>
    api.get(`${PRODUCTS_API}/products/${id}/`),

  getCategories: () =>
    api.get(`${PRODUCTS_API}/categories/`),
};

// ── Addresses ─────────────────────────────────────────────────────────────────

export const addressAPI = {
  getAll: () =>
    api.get(`${PRODUCTS_API}/addresses/`),

  create: (data: any) =>
    api.post(`${PRODUCTS_API}/addresses/`, data),

  update: (id: number, data: any) =>
    api.patch(`${PRODUCTS_API}/addresses/${id}/`, data),

  delete: (id: number) =>
    api.delete(`${PRODUCTS_API}/addresses/${id}/`),
};

export default api;
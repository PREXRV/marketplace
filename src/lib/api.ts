import axios from 'axios';

// ✅ Все запросы идут через /api/ → Next.js proxy → бэкенд
// Никаких прямых URL к Railway/localhost — CORS убит навсегда
const API_URL      = '/api';
const API_BASE_URL = '/api';

// ==================== ИНТЕРФЕЙСЫ ====================

export interface AttributeValue {
  id: number;
  value: string;
  color_code?: string;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  display_type: string;
  values: AttributeValue[];
}

export interface ProductAttribute {
  id: number;
  attribute_name: string;
  attribute_slug: string;
  display_type: string;
  value: string;
  color_code?: string;
}

export interface ProductImage {
  id: number;
  image: string;
  image_url?: string;   // ✅ прямой URL из бакета
  alt_text: string;
  is_main: boolean;
  order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: string | null;
  final_price?: string | null;
  discount_percentage?: number;
  stock: number;
  color: string;
  size: string;
  is_active: boolean;
  image?: string;
  image_url?: string;   // ✅ прямой URL из бакета
}

export interface ReviewMedia {
  id: number;
  media_type: 'image' | 'video';
  file: string;
  file_url?: string;    // ✅ прямой URL из бакета
  created_at: string;
  review?: {
    id: number;
    author_name: string;
    author_avatar?: string;
    rating: number;
    comment: string;
    created_at: string;
  };
}

export interface MediaGalleryItem {
  id: number;
  review: number;
  file: string;
  file_url: string;     // ✅ всегда полный URL из бакета
  media_type: 'image' | 'video';
  author_name: string | null;
  author_username: string | null;
  author_avatar?: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewReply {
  id: number;
  review: number;
  author: number;
  author_username: string;
  author_avatar: string | null;
  author_tags?: UserTag[];
  text: string;
  is_official: boolean;
  created_at: string;
  updated_at: string;
}

export interface YouTubeVideo {
  id: number;
  title: string;
  video_url: string;
  video_id: string;
  thumbnail_url: string;
  description?: string;
  duration?: string;
  views_count?: number;
  published_date?: string;
  order: number;
  embed_url: string;
  created_at: string;
}

export interface UserLevel {
  id: number;
  username: string;
  avatar: string | null;
  level: number;
  experience: number;
  bonus_points: number;
  progress_percent: number;
  next_level_exp: number;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  name: string;
  description: string;
  icon: string;
  quest_type: string;
  type_display: string;
  condition_type: string;
  condition_display: string;
  condition_value: number;
  experience_reward: number;
  bonus_points_reward: number;
  promo_code_discount: number;
  target_value: number;
  is_active: boolean;
  is_daily: boolean;
  order: number;
}

export interface UserQuest {
  id: number;
  quest: Quest;
  progress: number;
  progress_percent: number;
  is_completed: boolean;
  completed_at: string | null;
  expires_at?: string | null;
  time_left?: string | null;
  created_at?: string;
}

export interface RewardItem {
  id: number;
  name: string;
  description: string;
  item_type: 'user_tag' | 'promo_code' | 'free_product' | 'bonus_points';
  icon?: string;
  cost: number;
  stock: number;
  badge_color?: string;
  badge_text_color?: string;
  tag_name?: string;
  purchased_count?: number;
  image: string | null;
  available: boolean;
  is_active: boolean;
  user_tag?: number | null;
  user_tag_data?: {
    id: number;
    name: string;
    slug: string;
    background_color: string;
    text_color: string;
    icon: string;
  } | null;
  free_product?: number | null;
  free_product_data?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    image: string | null;
  } | null;
  promo_code?: number | null;
  bonus_points_amount?: number | null;
}

export interface RewardPurchase {
  id: number;
  reward: RewardItem;
  cost: number;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  action?: {
    type: 'free_product' | 'equip_tag' | 'show_code';
    label: string;
    url?: string;
    product_id?: number;
    product_slug?: string;
    purchase_id?: number;
    tag_id?: number;
    tag_slug?: string;
  } | null;
}

export interface LeaderboardEntry {
  id?: number;
  rank: number;
  username: string;
  avatar: string | null;
  level: number;
  experience?: number;
  total_experience?: number;
  exp_earned?: number;
  orders_count?: number;
  spent_amount?: string;
  total_purchases?: number;
  total_spent?: string;
  active_badges?: UserBadge[];
  year?: number;
  month?: number;
}

export interface DailyBonus {
  can_claim: boolean;
  streak_days: number;
  next_bonus: number;
  claimed_today: boolean;
}

export interface GamificationStats {
  level: number;
  experience: number;
  bonus_points: number;
  total_quests_completed: number;
  active_quests: number;
  badges_count: number;
  daily_streak: number;
  rank: number;
  rewards?: RewardItem[];
}

export interface Review {
  id: number;
  product: number;
  product_name?: string;
  product_slug?: string;
  author: number | null;
  author_name: string;
  author_email: string;
  author_avatar?: string;
  author_username?: string;
  author_tags?: UserTag[];
  rating: number;
  title: string;
  comment: string;
  pros: string;
  cons: string;
  order_number?: string;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  media: ReviewMedia[];
  replies: ReviewReply[];
}

export interface ReviewStats {
  count: number;
  average_rating: number;
  distribution: { [key: number]: { count: number; percentage: number } };
}

export interface CreateReviewData {
  product: number;
  author_name: string;
  author_email: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string;
  cons?: string;
  order_number?: string;
  media_files?: File[];
}

export interface SaleInfo {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  discount_type?: string;
  discount_value?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  old_price: string | null;
  final_price?: string;
  has_sale_discount?: boolean;
  sale_discount_amount?: string;
  discount_percentage?: number;
  active_sale?: SaleInfo | null;
  sku: string;
  stock: number;
  status: string;
  is_featured: boolean;
  is_new: boolean;
  category: number;
  category_name: string;
  is_in_stock: boolean;
  average_rating: number;
  reviews_count: number;
  primary_image?: string;   // ✅ уже полный URL из бакета
  images: ProductImage[];
  videos?: { url: string; title?: string }[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  created_at: string;
  wildberries_url?: string;
  ozon_url?: string;
  yandex_market_url?: string;
  sale_end_date?: string | null;
  rating_distribution: { [key: number]: number };
  is_on_sale?: boolean;
  availability_status?: 'in_stock' | 'made_to_order' | 'can_order';
  availability_status_display?: string;
  availability_label?: string;
  make_time_days_min?: number | null;
  make_time_days_max?: number | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  image_url?: string;   // ✅ прямой URL из бакета
  parent: number | null;
  is_active: boolean;
  order: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  price: number | string;
  quantity: number;
  return_status?: {
    id: number;
    status: string;
    status_display: string;
    return_number: string;
  } | null;
  is_free_reward?: boolean;
  return_quantity?: number;
  [key: string]: any;
  payment_status?: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'failed' | 'not_required';
}

export interface OrderReturnShort {
  id: number;
  return_number: string;
  status: string;
  status_display: string;
  reason_display: string;
  admin_comment?: string | null;
  customer_required_action?: string | null;
  created_at: string;
  [key: string]: any;
}

export interface Order {
  id: number;
  order_number: string;
  delivery_cost?: number;
  user?: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_type: string;
  delivery_type_display?: string;
  delivery_city: string;
  delivery_address: string;
  payment_type: string;
  payment_type_display?: string;
  status: string;
  status_display?: string;
  total_amount: string;
  discount_amount?: string;
  promo_code?: PromoCode;
  items?: OrderItem[];
  comment?: string;
  created_at: string;
  updated_at: string;
  active_returns?: OrderReturnShort[];
  has_returns?: boolean;
}

export interface Return {
  id: number;
  return_number: string;
  order: number;
  order_data?: Order;
  user: number;
  status: string;
  status_display: string;
  reason: string;
  reason_display: string;
  description: string;
  admin_comment?: string;
  items: ReturnItem[];
  media: ReturnMedia[];
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
}

export interface ReturnItem {
  id: number;
  order_item: number;
  quantity: number;
  product_name: string;
  product_image?: string;
  price: string;
}

export interface ReturnMedia {
  id: number;
  file: string;
  file_url: string;
  file_type: 'image' | 'video';
  uploaded_at: string;
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
  items: OrderItem[];
}

export interface ProductFilters {
  search?: string;
  category?: number;
  category_slug?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  ordering?: string;
  [key: string]: any;
  wildberries_url?: string;
  aliexpress_url?: string;
}

// ✅ User с avatar_url (URL из бакета) и avatar (write-only для загрузки)
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar?: string | null;       // write-only (для загрузки файла)
  avatar_url?: string | null;   // read (прямой URL из Яндекс бакета)
  birth_date?: string;
  city: string;
  address: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  date_joined: string;
  orders_count: number;
  active_badges?: UserBadge[];
  tags?: UserTag[];
  active_tags?: UserTag[];
}

export interface Notification {
  id: number;
  type: 'order_created' | 'order_status_changed' | 'order_delivered' | 'product_in_stock' | 'product_on_sale' | 'new_sale' | 'review_reply';
  type_display: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  order: number | null;
  order_number: string | null;
  product: number | null;
  product_name: string | null;
  product_image: string | null;
  sale: number | null;
  sale_name: string | null;
}

export interface NotificationResponse {
  count: number;
  notifications: Notification[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface Address {
  id: number;
  title: string;
  delivery_method?: number;
  delivery_method_details?: {
    id: number;
    name: string;
    code: string;
    icon_url?: string;
  };
  city: string;
  street: string;
  house: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  postal_code?: string;
  comment?: string;
  is_default: boolean;
  created_at?: string;
}

export interface UserTag {
  id?: number;
  name: string;
  slug: string;
  color?: string;
  background_color?: string;
  text_color?: string;
  icon: string;
}

export interface AdminTag {
  id: string;
  type: 'admin_tag';
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  badge_text_color: string;
  is_active: boolean;
  can_toggle: boolean;
  obtained_at: string;
}

export interface AllUserTags {
  admin_tags: AdminTag[];
  purchased_badges: UserBadge[];
  all_badges: (AdminTag | UserBadge)[];
}

export interface UserLevelInfo {
  level: number;
  experience: number;
  experience_needed: number;
  progress_percent: number;
  bonus_points: number;
  total_experience: number;
  next_level_reward: {
    bonus_points: number;
    promo_discount: number | null;
  };
}

export interface PersonalPromoCode {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  reason: string;
  is_used: boolean;
  created_at: string;
  used_at: string | null;
  end_date: string;
}

export interface ExperienceLog {
  amount: number;
  reason: string;
  level: number;
  created_at: string;
}

export interface BonusPointsLog {
  amount: number;
  reason: string;
  created_at: string;
}

export interface GamificationProfile {
  level_info: UserLevelInfo;
  quests: {
    daily: UserQuest[];
    weekly: UserQuest[];
    achievements: UserQuest[];
    completed: UserQuest[];
  };
  personal_promo_codes: PersonalPromoCode[];
  history: {
    experience: ExperienceLog[];
    bonus_points: BonusPointsLog[];
  };
}

export interface UserBadge {
  id: number;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  badge_text_color: string;
  is_active: boolean;
  obtained_at: string;
}

export interface DailyBonusStatus {
  claimed: boolean;
  day_streak?: number;
  bonus_amount?: number;
  next_day_streak?: number;
  next_bonus_amount?: number;
}

export interface ReferralLink {
  code: string;
  share_url: string;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  total_earned: number;
  created_at: string;
}

export interface ReferralEarning {
  id: number;
  buyer_name: string;
  order_number: string;
  commission_percentage: string;
  commission_amount: number;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  media_url?: string;
  media_file?: string;    // ✅ URL из бакета
  button_text?: string;
  button_link?: string;
  button_style?: string;
  button_text_2?: string;
  button_link_2?: string;
  button_style_2?: string;
  layout?: string;
  text_align?: string;
  bg_color?: string;
  bg_gradient_start?: string;
  bg_gradient_end?: string;
  text_color?: string;
  title_color?: string;
  overlay?: string;
  animation?: string;
  animation_duration?: number;
  height_desktop?: number;
  height_mobile?: number;
  show_title?: boolean;
  show_subtitle?: boolean;
  show_description?: boolean;
  show_buttons?: boolean;
  show_overlay?: boolean;
  solo_mode?: boolean;
}

export interface SocialPost {
  id: number;
  platform: string;
  title?: string;
  text?: string;
  short_text?: string;
  image?: string;         // ✅ URL из бакета
  image_url?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_embed_url?: string;
  duration?: number;
  is_video?: boolean;
  post_url: string;
  views_count?: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  post_date?: string;
  order?: number;
}

export interface DeliveryMethod {
  id: number;
  name: string;
  code: string;
  icon_url?: string;
  description?: string;
  price: string;
  delivery_time?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  icon: string;
  icon_url: string | null;
  code: string;
  additional_info: string;
}

export interface DeliveryPriceCalculation {
  delivery_method: string;
  order_amount: string;
  delivery_price: string;
  is_free: boolean;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  payment_id?: string;
  error?: string;
}

export interface PaymentStatus {
  success: boolean;
  order_number: string;
  payment_status: 'not_paid' | 'pending' | 'paid' | 'cancelled' | 'refunded';
  order_status: string;
}

export interface PromoCode {
  id?: number;
  code: string;
  discount_type?: string;
  discount_value?: string;
}

// ==================== API МЕТОДЫ ====================

export const api = {

  getDeliveryMethods: async (orderAmount?: number): Promise<DeliveryMethod[]> => {
    const url = orderAmount
      ? `${API_URL}/delivery-methods/?order_amount=${orderAmount}`
      : `${API_URL}/delivery-methods/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки способов доставки');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await fetch(`${API_URL}/payment-methods/`);
    if (!response.ok) throw new Error('Ошибка загрузки способов оплаты');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  replyReturn: async (token: string, returnId: number, data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/returns/${returnId}/reply/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data,
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Ошибка отправки ответа по возврату');
    return json;
  },

  // ==================== PRODUCTS ====================

  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const url = params.toString()
      ? `${API_URL}/products/?${params.toString()}`
      : `${API_URL}/products/`;
    const response = await axios.get(url);
    return response.data.results || response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await axios.get(`${API_URL}/products/${id}/`);
    return response.data;
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/?category=${categoryId}`);
    return response.data.results || response.data;
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/?search=${encodeURIComponent(query)}`);
    return response.data.results || response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/?is_featured=true`);
    return response.data.results || response.data;
  },

  getNewProducts: async (): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/?is_new=true`);
    return response.data.results || response.data;
  },

  // ==================== CATEGORIES ====================

  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/categories/`);
    return response.data.results || response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await axios.get(`${API_URL}/categories/${id}/`);
    return response.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axios.get(`${API_URL}/categories/?slug=${slug}`);
    const data = response.data.results || response.data;
    return Array.isArray(data) ? data[0] : data;
  },

  getMyAllTags: async (token: string): Promise<AllUserTags> => {
    const response = await fetch(`${API_URL}/my-all-tags/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch all tags');
    return response.json();
  },

  // ==================== ATTRIBUTES ====================

  getAttributes: async (categorySlug?: string): Promise<Attribute[]> => {
    const url = categorySlug
      ? `${API_URL}/attributes/?category_slug=${categorySlug}`
      : `${API_URL}/attributes/`;
    const response = await axios.get(url);
    return response.data.results || response.data;
  },

  // ==================== AUTH ====================

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors ? JSON.stringify(error.errors) : 'Ошибка регистрации');
    }
    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors ? JSON.stringify(error.errors) : 'Ошибка входа');
    }
    return response.json();
  },

  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!response.ok) throw new Error('Не удалось обновить токен');
    return response.json();
  },

  // ==================== USER PROFILE ====================

  getProfile: async (token: string): Promise<User> => {
    const response = await fetch(`${API_URL}/profile/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Не удалось загрузить профиль');
    return response.json();
  },

  updateProfile: async (token: string, data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await fetch(`${API_URL}/profile/update/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors ? JSON.stringify(error.errors) : 'Ошибка обновления профиля');
    }
    return response.json();
  },

  changePassword: async (token: string, data: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }) => {
    const response = await fetch(`${API_URL}/profile/change-password/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors ? JSON.stringify(error.errors) : 'Ошибка смены пароля');
    }
    return response.json();
  },

  uploadAvatar: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_URL}/profile/upload-avatar/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка загрузки аватарки');
    }
    return response.json();
    // ✅ response содержит { avatar_url, user } — используй data.avatar_url для отображения
  },

  deleteAvatar: async (token: string) => {
    const response = await fetch(`${API_URL}/profile/delete-avatar/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления аватарки');
    }
    return response.json();
  },

  setActiveTag: async (token: string, tagId: number | null): Promise<any> => {
    const response = await fetch(`${API_URL}/profile/set-active-tag/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag_id: tagId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка установки тега');
    }
    return response.json();
  },

  getUserOrders: async (token: string): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Не удалось загрузить заказы');
    return response.json();
  },

  // ==================== ADDRESSES ====================

  getAddresses: async (token: string): Promise<Address[]> => {
    const response = await fetch(`${API_BASE_URL}/addresses/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка загрузки адресов');
    return response.json();
  },

  createAddress: async (token: string, data: Omit<Address, 'id' | 'created_at'>): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}/addresses/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Ошибка создания адреса');
    return json;
  },

  updateAddress: async (token: string, id: number, data: Partial<Address>): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || 'Ошибка обновления адреса');
    return json;
  },

  deleteAddress: async (token: string, id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/addresses/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка удаления адреса');
  },

  // ==================== REVIEWS ====================

  getReviews: async (productId: number): Promise<Review[]> => {
    const response = await fetch(`${API_URL}/reviews/?product=${productId}`);
    if (!response.ok) throw new Error('Ошибка загрузки отзывов');
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  getMyReviews: async (token: string): Promise<Review[]> => {
    const response = await fetch(`${API_URL}/reviews/my/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка ${response.status}: ${errorText}`);
    }
    return response.json();
  },

  updateMyReview: async (token: string, reviewId: number, data: Partial<Review>) => {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/update_my_review/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка обновления отзыва');
    }
    return response.json();
  },

  addReviewReply: async (token: string, reviewId: number, text: string) => {
    const response = await fetch(`${API_URL}/reviews/${reviewId}/add_reply/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Ошибка добавления ответа');
    }
    return response.json();
  },

  getReviewStats: async (productId: number): Promise<ReviewStats> => {
    const response = await axios.get(`${API_URL}/reviews/stats/?product=${productId}`);
    return response.data;
  },

  createReview: async (reviewData: CreateReviewData, token?: string) => {
    const formData = new FormData();
    formData.append('product', reviewData.product.toString());
    formData.append('author_name', reviewData.author_name);
    formData.append('author_email', reviewData.author_email);
    formData.append('rating', reviewData.rating.toString());
    formData.append('title', reviewData.title);
    formData.append('comment', reviewData.comment);
    if (reviewData.pros)         formData.append('pros', reviewData.pros);
    if (reviewData.cons)         formData.append('cons', reviewData.cons);
    if (reviewData.order_number) formData.append('order_number', reviewData.order_number);
    if (reviewData.media_files?.length) {
      reviewData.media_files.forEach(file => formData.append('media_files', file));
    }
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.post(`${API_URL}/reviews/`, formData, { headers });
    return response.data;
  },

  markReviewHelpful: async (reviewId: number) => {
    const response = await axios.post(`${API_URL}/reviews/${reviewId}/helpful/`);
    return response.data;
  },

  markReviewNotHelpful: async (reviewId: number) => {
    const response = await axios.post(`${API_URL}/reviews/${reviewId}/not_helpful/`);
    return response.data;
  },

  getMediaGallery: async (productId: number): Promise<MediaGalleryItem[]> => {
    const response = await axios.get(`${API_URL}/media-gallery/${productId}/`);
    return response.data;
  },

  // ==================== ORDERS ====================

  createOrder: async (orderData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/orders/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка создания заказа');
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await axios.get(`${API_URL}/orders/`);
    return response.data.results || response.data;
  },

  getOrder: async (id: number) => {
    const response = await axios.get(`${API_URL}/orders/${id}/`);
    return response.data;
  },

  // ==================== FAVORITES ====================

  getFavorites: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/favorites/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  toggleFavorite: async (token: string, productId: number) => {
    const response = await fetch(`${API_URL}/favorites/toggle/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  addToFavorites: async (token: string, productId: number) => {
    const response = await fetch(`${API_URL}/favorites/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления в избранное');
    }
    return response.json();
  },

  removeFromFavorites: async (token: string, productId: number) => {
    const response = await fetch(`${API_URL}/favorites/${productId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления из избранного');
    }
    return response.json();
  },

  checkFavorite: async (token: string, productId: number): Promise<boolean> => {
    try {
      const favorites = await fetch(`${API_URL}/favorites/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!favorites.ok) return false;
      const data = await favorites.json();
      return data.some((fav: any) => fav.product.id === productId);
    } catch {
      return false;
    }
  },

  // ==================== NOTIFICATIONS ====================

  getNotifications: async (token: string): Promise<Notification[]> => {
    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || data.notifications || [];
    } catch { return []; }
  },

  getUnreadNotifications: async (token: string): Promise<NotificationResponse> => {
    try {
      const response = await fetch(`${API_URL}/notifications/unread/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return { count: 0, notifications: [] };
      return response.json();
    } catch { return { count: 0, notifications: [] }; }
  },

  getAllNotifications: async (token: string): Promise<Notification[]> => {
    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch { return []; }
  },

  getUnreadCount: async (token: string): Promise<{ count: number }> => {
    try {
      const response = await fetch(`${API_URL}/notifications/unread_count/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    } catch { return { count: 0 }; }
  },

  markNotificationAsRead: async (token: string, notificationId: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/mark_as_read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error();
      return response.json();
    } catch { return null; }
  },

  markAllNotificationsAsRead: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark_all_as_read/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error();
      return response.json();
    } catch { return null; }
  },

  deleteNotification: async (token: string, notificationId: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/delete_notification/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error();
      return response.json();
    } catch { return null; }
  },

  getOrderStatusHistory: async (token: string, orderId: number) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/history/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return [];
      return response.json();
    } catch { return []; }
  },

  // ==================== GAMIFICATION ====================

  getGamificationProfile: async (token: string): Promise<GamificationProfile> => {
    const response = await fetch(`${API_BASE_URL}/gamification/stats/profile/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch gamification profile');
    const text = await response.text();
    if (!text) throw new Error('Empty response');
    return JSON.parse(text);
  },

  getGamificationStats: async (token: string): Promise<GamificationStats> => {
    const response = await fetch(`${API_BASE_URL}/gamification/stats/stats/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch gamification stats');
    return response.json();
  },

  getMyLevel: async (token: string): Promise<UserLevel> => {
    const response = await fetch(`${API_BASE_URL}/gamification/stats/my_level/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user level');
    return response.json();
  },

  getQuests: async (token: string): Promise<Quest[]> => {
    const response = await fetch(`${API_BASE_URL}/gamification/quests/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch quests');
    return response.json();
  },

  getMyQuests: async (token: string): Promise<UserQuest[]> => {
    const response = await fetch(`${API_BASE_URL}/gamification/quests/my_quests/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user quests');
    return response.json();
  },

  startQuest: async (questId: number, token: string): Promise<UserQuest> => {
    const response = await fetch(`${API_BASE_URL}/gamification/quests/${questId}/start/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to start quest');
    return response.json();
  },

  claimQuestReward: async (questId: number, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/quests/${questId}/claim_reward/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to claim quest reward');
    return response.json();
  },

  getRewards: async (token: string): Promise<RewardItem[]> => {
    const response = await fetch(`${API_BASE_URL}/gamification/rewards/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch rewards');
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || [];
  },

  purchaseReward: async (rewardId: number, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/rewards/${rewardId}/purchase/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to purchase reward');
    }
    return response.json();
  },

  getMyPurchases: async (token: string): Promise<RewardPurchase[]> => {
    const response = await fetch(`${API_BASE_URL}/gamification/rewards/my_purchases/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },

  // ✅ Исправлен захардкоженный localhost
  clickQuest: async (questId: number, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/quests/${questId}/click/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.detail || 'Failed to track quest click');
    return json;
  },

  toggleBadge: async (token: string, badgeId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/badges/${badgeId}/toggle/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to toggle badge');
    }
    return response.json();
  },

  addFreeProductToCart: async (
    productId: number,
    purchaseId: number,
    token: string
  ): Promise<{ success: boolean; message: string; product_slug?: string }> => {
    const response = await fetch(`${API_BASE_URL}/gamification/rewards/add_free_to_cart/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, purchase_id: purchaseId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка добавления бесплатного товара');
    }
    return response.json();
  },

  useRewardPurchase: async (purchaseId: number, token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/rewards/${purchaseId}/use/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка использования награды');
    }
    return response.json();
  },

  getLeaderboard: async (year?: number, month?: number): Promise<LeaderboardEntry[]> => {
    const params = new URLSearchParams();
    if (year)  params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const response = await fetch(`${API_BASE_URL}/gamification/leaderboard/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  getTopPlayers: async (): Promise<UserLevel[]> => {
    const response = await fetch(`${API_BASE_URL}/gamification/leaderboard/top_players/`);
    if (!response.ok) throw new Error('Failed to fetch top players');
    return response.json();
  },

  getMyRank: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/leaderboard/my_rank/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch rank');
    return response.json();
  },

  claimDailyBonus: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/gamification/daily-bonus/claim/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to claim bonus');
    }
    return response.json();
  },

  getDailyBonusStatus: async (token: string): Promise<DailyBonus> => {
    const response = await fetch(`${API_BASE_URL}/gamification/daily-bonus/status/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch daily bonus status');
    return response.json();
  },

  // ==================== PROMO CODES ====================

  validatePromoCode: async (code: string, orderAmount?: number) => {
    const response = await fetch(`${API_URL}/promo-codes/validate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim(), order_amount: orderAmount || 0 }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка валидации промокода');
    }
    return response.json();
  },

  applyPromoCode: async (code: string, orderTotal: number) => {
    const response = await fetch(`${API_URL}/promo-codes/validate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase().trim(), order_amount: orderTotal }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Промокод недействителен');
    }
    return response.json();
  },

  // ==================== RETURNS ====================

  createReturn: async (token: string, data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/returns/create/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || JSON.stringify(error) || 'Ошибка создания возврата');
    }
    return response.json();
  },

  getUserReturns: async (token: string): Promise<Return[]> => {
    const response = await fetch(`${API_BASE_URL}/returns/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка загрузки возвратов');
    return response.json();
  },

  getReturnDetail: async (token: string, returnId: number): Promise<Return> => {
    const response = await fetch(`${API_BASE_URL}/returns/${returnId}/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Ошибка загрузки возврата');
    return response.json();
  },

  // ==================== HOMEPAGE ====================

  publicHomepage: async (): Promise<{
    banners: Banner[];
    social_posts: SocialPost[];
    youtube_videos: YouTubeVideo[];
    products_on_sale: Product[];
    sale_info: {
      id: number;
      name: string;
      description: string;
      start_date: string;
      end_date: string;
      discount_type: string;
      discount_value: string;
    } | null;
  }> => {
    try {
      const response = await fetch(`${API_URL}/homepage/public/`);
      if (!response.ok) throw new Error('Failed to load homepage');
      return response.json();
    } catch {
      return { banners: [], social_posts: [], youtube_videos: [], products_on_sale: [], sale_info: null };
    }
  },

  getMyReferralLink: async (token: string): Promise<ReferralLink | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/referral/my-link/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return response.json();
    } catch { return null; }
  },

  createPayment: async (orderId: number): Promise<PaymentResponse> => {
    const res = await fetch(`${API_URL}/orders/payment/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });
    return res.json();
  },

  checkPaymentStatus: async (orderId: number): Promise<PaymentStatus> => {
    const res = await fetch(`${API_URL}/orders/payment/status/${orderId}/`);
    return res.json();
  },
};

// ==================== УТИЛИТЫ ====================

/**
 * ✅ getImageUrl — больше НЕ добавляет localhost к URL.
 * Все медиа из бакета уже приходят с полным URL (https://storage.yandexcloud.net/...)
 * Функция нужна только как fallback для плейсхолдера.
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return 'https://placehold.co/400x400/e2e8f0/64748b.png?text=No+Image';
  // Если уже полный URL (из бакета или внешний) — возвращаем как есть
  if (imagePath.startsWith('http')) return imagePath;
  // Fallback: относительный путь — маловероятно после перехода на бакет
  return imagePath;
};

export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('ru-RU');
};

export default api;

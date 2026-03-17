'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { partnershipAPI, productsAPI, addressAPI, deliveryAPI } from '@/services/api';
import {
  Package, Search, CheckCircle, Clock, XCircle, Truck,
  MapPin, Plus, AlertTriangle, ShoppingBag, Copy, ExternalLink, BarChart2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type Tab = 'catalog' | 'requests' | 'myproducts';

interface DeliveryMethod {
  id: number; name: string; code: string;
  iconurl?: string; price: string; deliverytime?: string;
}

export default function RequestProductPage() {
  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  const [products, setProducts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: 'Основной', city: '', street: '', house: '',
    apartment: '', postal_code: '', comment: '',
    is_default: true, delivery_method: '' as number | '',
  });

  useEffect(() => { fetchData(); }, []);

  // ✅ Трекинг поиска по артикулу с дебаунсом
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      partnershipAPI.trackSkuSearch(searchQuery.trim()).catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      const [productsRes, requestsRes, addressesRes, methods, myProductsRes] = await Promise.all([
        productsAPI.getProducts(),
        partnershipAPI.getProductRequests(),
        addressAPI.getAll(),
        deliveryAPI.getMethods(),
        partnershipAPI.getMyProducts(),
      ]);

      setProducts(productsRes.data.results || productsRes.data || []);
      setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setMyProducts(Array.isArray(myProductsRes.data) ? myProductsRes.data : []);

      const addrs = addressesRes.data.results || addressesRes.data || [];
      setAddresses(addrs);
      const defAddr = addrs.find((a: any) => a.is_default) || addrs[0] || null;
      setDefaultAddress(defAddr);
      setDeliveryMethods(methods);

      if (!defAddr && methods.length > 0) {
        setAddressForm(p => ({ ...p, delivery_method: methods[0].id }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Трекинг просмотра товара
  const handleOpenProduct = (product: any) => {
    setSelectedProduct(product);
    const refToken = sessionStorage.getItem('reftoken');
    if (refToken) {
      partnershipAPI.trackRefView(refToken).catch(() => {});
    }
  };

  const handleRequest = async (productId: number) => {
    if (!defaultAddress) {
      setPendingProductId(productId);
      setShowAddressModal(true);
      setSelectedProduct(null);
      return;
    }
    await submitRequest(productId);
  };

  const submitRequest = async (productId: number) => {
    try {
      await partnershipAPI.createProductRequest({ product: productId });
      toast.success('Запрос отправлен!');
      setSelectedProduct(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ошибка создания запроса');
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.city || !addressForm.street || !addressForm.house) {
      toast.error('Заполните: город, улица, дом');
      return;
    }
    if (!addressForm.delivery_method) {
      toast.error('Выберите способ доставки');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await addressAPI.create(addressForm);
      setDefaultAddress(res.data);
      setAddresses(prev => [...prev, res.data]);
      toast.success('Адрес сохранён!');
      setShowAddressModal(false);
      if (pendingProductId) {
        await submitRequest(pendingProductId);
        setPendingProductId(null);
      }
    } catch {
      toast.error('Ошибка сохранения адреса');
    } finally {
      setSavingAddress(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопирован!`);
  };

  const getProductName = (p: any) => p?.name || p?.title || '—';

  const filteredProducts = products.filter(p =>
    (p?.name || p?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':  return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':   return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'shipped':   return <Truck className="w-5 h-5 text-blue-600" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':  return <XCircle className="w-5 h-5 text-red-600" />;
      default:          return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDeliveryMethodName = (addr: any) => {
    if (addr?.delivery_method_details?.name) return addr.delivery_method_details.name;
    return deliveryMethods.find(m => m.id === addr?.delivery_method)?.name || null;
  };

  const TABS: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'catalog',    label: 'Запрос товара', icon: Search },
    { key: 'requests',   label: 'Мои запросы',   icon: Clock,       count: requests.length },
    { key: 'myproducts', label: 'Мои товары',     icon: ShoppingBag, count: myProducts.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Товары</h1>
        <p className="text-gray-500 text-sm">
          Запрашивайте товары, отслеживайте статусы и управляйте своими ссылками
        </p>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${activeTab === key
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count !== undefined && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                ${activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ КАТАЛОГ ═══ */}
      {activeTab === 'catalog' && (
        <div>
          {defaultAddress ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Адрес доставки</p>
                <p className="text-sm text-green-700">
                  {defaultAddress.city}, {defaultAddress.street}, д. {defaultAddress.house}
                  {defaultAddress.apartment && `, кв. ${defaultAddress.apartment}`}
                </p>
                {getDeliveryMethodName(defaultAddress) && (
                  <p className="text-xs text-green-700 mt-0.5">
                    Способ: {getDeliveryMethodName(defaultAddress)}
                  </p>
                )}
              </div>
              <Link href="/profile/addresses" className="text-sm text-green-700 hover:underline font-medium">
                Изменить
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Адрес не указан</p>
                <p className="text-sm text-yellow-700">Укажите адрес и способ доставки</p>
              </div>
              <button onClick={() => setShowAddressModal(true)}
                className="text-sm text-yellow-700 hover:underline font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> Добавить
              </button>
            </div>
          )}

          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                  // ✅ используем handleOpenProduct вместо setSelectedProduct
                  onClick={() => handleOpenProduct(product)}
                >
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0].image}
                      alt={getProductName(product)}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-1 line-clamp-1">
                      {getProductName(product)}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-purple-600">
                        {product.price} ₽
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); handleRequest(product.id); }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-purple-700 transition"
                      >
                        Запросить
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ МОИ ЗАПРОСЫ ═══ */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">Нет активных запросов</p>
              <button onClick={() => setActiveTab('catalog')}
                className="mt-4 text-purple-600 hover:underline text-sm font-medium">
                Перейти к каталогу →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(request => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {request.product_image ? (
                      <img
                        src={request.product_image}
                        alt={request.product_title}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{request.product_title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                      </p>
                      {request.tracking_number && (
                        <p className="text-sm text-purple-600 font-mono mt-1">
                          📦 {request.tracking_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className="font-semibold text-gray-700 text-sm">
                      {request.status_display}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ МОИ ТОВАРЫ ═══ */}
      {activeTab === 'myproducts' && (
        <div>
          {myProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">Нет доставленных товаров</p>
              <p className="text-gray-400 text-sm mt-2">
                Товары появятся здесь после подтверждения доставки
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProducts.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="flex gap-4 p-5 border-b border-gray-100">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-7 h-7 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold leading-tight">{item.product_name}</h3>
                      <p className="text-purple-600 font-bold mt-1">{item.product_price} ₽</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Получен: {new Date(item.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Реферальная ссылка */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                        Реферальная ссылка
                      </p>
                      <div className="flex items-center gap-2 bg-purple-50 rounded-xl p-3">
                        <span className="text-sm text-purple-700 font-mono flex-1 truncate">
                          {item.referral_link}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.referral_link, 'Ссылка')}
                          className="p-1.5 hover:bg-purple-100 rounded-lg transition flex-shrink-0"
                        >
                          <Copy className="w-4 h-4 text-purple-600" />
                        </button>
                        <a
                          href={item.referral_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-purple-100 rounded-lg transition flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4 text-purple-600" />
                        </a>
                      </div>
                    </div>

                    {/* Артикул */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                        Артикул для поиска
                      </p>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                        <span className="text-sm font-mono font-bold text-gray-700 flex-1">
                          {item.custom_sku}
                        </span>
                        <button
                          onClick={() => copyToClipboard(item.custom_sku, 'Артикул')}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        По этому артикулу покупатели найдут товар — переходы засчитаются вам
                      </p>
                    </div>

                    {/* ✅ Статистика — данные с бэкенда */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" /> Статистика
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Просмотры', value: item.views_count ?? 0,  color: 'text-blue-600' },
                          { label: 'В корзину', value: item.cart_adds ?? 0,    color: 'text-orange-600' },
                          { label: 'Покупки',   value: item.purchases ?? 0,    color: 'text-green-600' },
                        ].map(stat => (
                          <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модал товара */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {selectedProduct.images?.length > 0 ? (
                <img
                  src={selectedProduct.images[0].image}
                  alt={getProductName(selectedProduct)}
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-3">{getProductName(selectedProduct)}</h2>
                <p className="text-gray-500 mb-4">{selectedProduct.description}</p>

                {defaultAddress ? (
                  <div className="bg-green-50 rounded-xl p-3 mb-6 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">
                      {defaultAddress.city}, {defaultAddress.street}, д. {defaultAddress.house}
                    </span>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-xl p-3 mb-6 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700">Сначала укажите адрес доставки</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-purple-600">
                    {selectedProduct.price} ₽
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                      Закрыть
                    </button>
                    <button
                      onClick={() => handleRequest(selectedProduct.id)}
                      className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition"
                    >
                      Запросить товар
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модал адреса */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Адрес доставки</h2>
                  <p className="text-gray-400 text-sm">Нужен для отправки товара</p>
                </div>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Город', key: 'city', placeholder: 'Москва', required: true, span: 2 },
                    { label: 'Улица', key: 'street', placeholder: 'ул. Ленина', required: true, span: 2 },
                    { label: 'Дом', key: 'house', placeholder: '15', required: true, span: 1 },
                    { label: 'Квартира', key: 'apartment', placeholder: '42', required: false, span: 1 },
                    { label: 'Индекс', key: 'postal_code', placeholder: '123456', required: false, span: 2 },
                  ].map(field => (
                    <div key={field.key} className={`col-span-${field.span}`}>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={(addressForm as any)[field.key]}
                        onChange={e => setAddressForm(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition"
                      />
                    </div>
                  ))}

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Способ доставки <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressForm.delivery_method || ''}
                      onChange={e => setAddressForm(p => ({
                        ...p, delivery_method: e.target.value ? Number(e.target.value) : ''
                      }))}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition bg-white"
                    >
                      <option value="">Выберите способ доставки</option>
                      {deliveryMethods.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                          {m.price ? ` — ${Number(m.price) === 0 ? 'бесплатно' : `${m.price} ₽`}` : ''}
                          {m.deliverytime ? ` (${m.deliverytime})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Комментарий
                    </label>
                    <textarea
                      value={addressForm.comment}
                      onChange={e => setAddressForm(p => ({ ...p, comment: e.target.value }))}
                      placeholder="Код домофона, ориентир..."
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-70 transition"
                  >
                    {savingAddress ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Сохранение...
                      </span>
                    ) : '💾 Сохранить и продолжить'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

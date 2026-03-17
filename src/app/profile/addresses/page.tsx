'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { api, Address } from '@/lib/api';

export default function AddressesPage() {
  const { user, tokens, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    delivery_method: null as number | null,
    city: '',
    street: '',
    house: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    postal_code: '',
    comment: '',
    is_default: false,
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (tokens) {
      loadAddresses();
      loadDeliveryMethods();
    }
  }, [authLoading, isAuthenticated, tokens]);

  const loadDeliveryMethods = async () => {
    try {
      const methods = await api.getDeliveryMethods();
      setDeliveryMethods(methods);
    } catch (error) {
      console.error('Ошибка загрузки способов доставки:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await api.getAddresses(tokens!.access);
      
      if (Array.isArray(data)) {
        setAddresses(data);
      } else if (data && Array.isArray((data as any).results)) {
        setAddresses((data as any).results);
      } else {
        console.error('API вернул неожиданную структуру:', data);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки адресов:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const openModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        delivery_method: address.delivery_method || null,
        city: address.city,
        street: address.street,
        house: address.house,
        apartment: address.apartment || '',
        entrance: address.entrance || '',
        floor: address.floor || '',
        intercom: address.intercom || '',
        postal_code: address.postal_code || '',
        comment: address.comment || '',
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        title: '',
        delivery_method: null,
        city: user.city || '',
        street: '',
        house: '',
        apartment: '',
        entrance: '',
        floor: '',
        intercom: '',
        postal_code: '',
        comment: '',
        is_default: addresses.length === 0,
      });
    }
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : (name === 'delivery_method' ? (value ? Number(value) : null) : value),
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingAddress) {
        await api.updateAddress(tokens!.access, editingAddress.id, formData);
      } else {
        await api.createAddress(tokens!.access, formData);
      }
      
      await loadAddresses();
      closeModal();
    } catch (error: any) {
      console.error('Ошибка сохранения адреса:', error);
      setError(error.message || 'Ошибка сохранения адреса');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот адрес?')) {
      return;
    }

    try {
      await api.deleteAddress(tokens!.access, id);
      await loadAddresses();
    } catch (error) {
      console.error('Ошибка удаления адреса:', error);
      alert('Не удалось удалить адрес');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/profile" className="hover:text-primary transition">Профиль</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">Адреса доставки</span>
        </div>

        {/* Заголовок */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Адреса доставки</h1>
            <p className="text-gray-600">Управление адресами для быстрого оформления заказов</p>
          </div>
          <button
            onClick={() => openModal()}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить адрес
          </button>
        </div>

        {/* Список адресов */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка адресов...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Адресов пока нет</h3>
            <p className="text-gray-600 mb-6">Добавьте адрес для быстрого оформления заказов</p>
            <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить первый адрес
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden ${
                  address.is_default ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="p-6">
                  {/* Заголовок */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {address.delivery_method_details?.icon_url ? (
                          <img 
                            src={address.delivery_method_details.icon_url} 
                            alt={address.delivery_method_details.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{address.title}</h3>
                        <p className="text-sm text-gray-600">
                          {address.delivery_method_details?.name || 'Способ не указан'}
                        </p>
                      </div>
                    </div>
                    {address.is_default && (
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                        Основной
                      </span>
                    )}
                  </div>

                  {/* Адрес */}
                  <div className="space-y-2 mb-4 text-sm text-gray-700">
                    <p className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {address.city}, {address.street}, д. {address.house}
                        {address.apartment && `, кв. ${address.apartment}`}
                      </span>
                    </p>
                    
                    {(address.entrance || address.floor || address.intercom) && (
                      <p className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {address.entrance && `Подъезд ${address.entrance}`}
                          {address.floor && `, этаж ${address.floor}`}
                          {address.intercom && `, домофон ${address.intercom}`}
                        </span>
                      </p>
                    )}

                    {address.postal_code && (
                      <p className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Индекс: {address.postal_code}</span>
                      </p>
                    )}

                    {address.comment && (
                      <p className="text-gray-600 italic text-xs mt-2">
                        "{address.comment}"
                      </p>
                    )}
                  </div>

                  {/* Действия */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => openModal(address)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingAddress ? 'Редактировать адрес' : 'Добавить новый адрес'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название адреса <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Дом, Работа, Дача..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Способ доставки <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="delivery_method"
                    value={formData.delivery_method || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Выберите способ доставки</option>
                    {deliveryMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Превью выбранного метода */}
                  {formData.delivery_method && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      {(() => {
                        const selected = deliveryMethods.find(m => m.id === Number(formData.delivery_method));
                        if (selected) {
                          return (
                            <>
                              {selected.icon_url && (
                                <img 
                                  src={selected.icon_url} 
                                  alt={selected.name}
                                  className="w-6 h-6 object-contain"
                                />
                              )}
                              <span className="font-medium">{selected.name}</span>
                              {selected.delivery_time && (
                                <span className="text-gray-400">• {selected.delivery_time}</span>
                              )}
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Город <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Москва"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Улица <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ул. Пушкина"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дом <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="house"
                    value={formData.house}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label className="font-medium">
                  Сделать основным адресом
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Сохранение...
                    </span>
                  ) : (
                    editingAddress ? 'Сохранить изменения' : 'Добавить адрес'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Attribute, Category } from '@/lib/api';

interface ProductFiltersProps {
  categorySlug?: string;
}

export default function ProductFilters({ categorySlug }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('min_price') || '', 
    max: searchParams.get('max_price') || '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters();
  }, [categorySlug]);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [attributesData, categoriesData] = await Promise.all([
        api.getAttributes(categorySlug),
        api.getCategories()
      ]);
      
      setAttributes(Array.isArray(attributesData) ? attributesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки фильтров:', error);
      setError(error.message || 'Не удалось загрузить фильтры');
      setAttributes([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (attrSlug: string, valueId: number) => {
    const key = `attr_${attrSlug}`;
    const currentValue = searchParams.get(key);
    
    let selectedValues = currentValue ? currentValue.split(',').map(Number) : [];
    
    if (selectedValues.includes(valueId)) {
      selectedValues = selectedValues.filter(id => id !== valueId);
    } else {
      selectedValues.push(valueId);
    }
    
    const newValue = selectedValues.length > 0 ? selectedValues.join(',') : null;
    updateURL({ [key]: newValue });
  };

  const isValueSelected = (attrSlug: string, valueId: number): boolean => {
    const key = `attr_${attrSlug}`;
    const currentValue = searchParams.get(key);
    if (!currentValue) return false;
    
    const selectedValues = currentValue.split(',').map(Number);
    return selectedValues.includes(valueId);
  };

  const getSelectedCount = (attrSlug: string): number => {
    const key = `attr_${attrSlug}`;
    const currentValue = searchParams.get(key);
    if (!currentValue) return 0;
    return currentValue.split(',').length;
  };

  const handlePriceFilter = () => {
    updateURL({
      min_price: priceRange.min || null,
      max_price: priceRange.max || null
    });
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = () => {
    return Array.from(searchParams.keys()).some(key => 
      key.startsWith('attr_') || key === 'min_price' || key === 'max_price' || key === 'in_stock' || key === 'category'
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg sticky top-4">
      {/* Заголовок */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фильтры
          </h3>
          {hasActiveFilters() && (
            <button 
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 hover:underline transition font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Сбросить
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* ✅ КАТЕГОРИИ */}
        {categories.length > 0 && (
          <div className="pb-6 border-b border-gray-200">
            <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
              Категория
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => updateURL({ category: null })}
                className={`
                  w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
                  ${!searchParams.get('category') 
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                Все категории
              </button>
              {categories.map((category) => {
                const isActive = searchParams.get('category') === category.id.toString();
                return (
                  <button
                    key={category.id}
                    onClick={() => updateURL({ category: category.id.toString() })}
                    className={`
                      w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }
                    `}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Фильтр по цене */}
        <div className="pb-6 border-b border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
            Цена, ₽
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="От"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                min="0"
              />
              <span className="text-gray-400 font-medium">—</span>
              <input
                type="number"
                placeholder="До"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                min="0"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              disabled={!priceRange.min && !priceRange.max}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              Применить
            </button>
          </div>
        </div>

        {/* Фильтр по наличию */}
        <div className="pb-6 border-b border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition">
            <input
              type="checkbox"
              checked={searchParams.get('in_stock') === 'true'}
              onChange={(e) => updateURL({ in_stock: e.target.checked ? 'true' : null })}
              className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900">
              Только в наличии
            </span>
          </label>
        </div>

        {/* Динамические фильтры по характеристикам */}
        {Array.isArray(attributes) && attributes.length > 0 && attributes.map((attr) => {
          const selectedCount = getSelectedCount(attr.slug);
          
          return (
            <div key={attr.id} className="pb-6 border-b border-gray-200 last:border-0">
              <h4 className="font-semibold mb-3 text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {attr.name}
                  {selectedCount > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {selectedCount}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  ({attr.values?.length || 0})
                </span>
              </h4>
              <div className="space-y-2">
                {Array.isArray(attr.values) && attr.values.map((value) => {
                  const isActive = isValueSelected(attr.slug, value.id);
                  
                  return (
                        <label 
                          key={value.id} 
                          className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition ${
                            isActive 
                              ? 'bg-blue-50 border border-blue-300 shadow-sm' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleFilterChange(attr.slug, value.id)}
                            className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer"
                          />
                          
                          {value.color_code && (
                            <span
                              className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: value.color_code }}
                              title={value.value}
                            />
                          )}
                          
                          <span className={`text-sm flex-1 ${isActive ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {value.value}
                          </span>
                        </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Attribute, Category } from '@/lib/api';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
  isExpanded?: boolean;
}

interface ProductFiltersProps {
  categorySlug?: string;
}

export default function ProductFilters({ categorySlug }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [priceRange, setPriceRange] = useState({ 
    min: searchParams.get('min_price') || '', 
    max: searchParams.get('max_price') || '' 
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build category tree
  const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
    const map: { [key: number]: CategoryTree } = {};
    const roots: CategoryTree[] = [];

    categories.forEach(cat => {
      const node: CategoryTree = { ...cat, children: [], level: 0, isExpanded: false };
      map[cat.id] = node;
    });

    categories.forEach(cat => {
      const node = map[cat.id];
      if (cat.parent) {
        const parent = map[cat.parent.id];
        if (parent) {
          node.level = parent.level + 1;
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

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
      setCategories(buildCategoryTree(Array.isArray(categoriesData) ? categoriesData : []));
    } catch (error: any) {
      console.error('❌ Ошибка загрузки фильтров:', error);
      setError(error.message || 'Не удалось загрузить фильтры');
      setCategories([]);
      setAttributes([]);
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

  // Category handlers
  const toggleCategory = (catId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(catId)) {
        newSet.delete(catId);
      } else {
        newSet.add(catId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (category: CategoryTree) => {
    updateURL({ category: category.id.toString() });
  };

  const isCategoryActive = (categoryId: number): boolean => {
    const activeCat = searchParams.get('category');
    return activeCat === categoryId.toString();
  };

  // Render category tree recursively
  const renderCategoryTree = (categories: CategoryTree[], level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className={`ml-${level * 4} mb-1 last:mb-0`}>
        <button
          onClick={() => handleCategoryClick(category)}
          className={`
            w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
            flex items-center justify-between
            ${isCategoryActive(category.id)
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-[1.02]'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 hover:shadow-sm'
            }
          `}
        >
          <span className={`truncate ${level > 0 ? 'ml-2' : ''}`}>
            {category.name}
          </span>
          {category.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/50 transition ml-2"
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </button>
        
        {expandedCategories.has(category.id) && category.children.length > 0 && (
          <div className="ml-4 mt-1 space-y-1">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Attribute handlers
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
    return currentValue ? currentValue.split(',').length : 0;
  };

  // Price handler
  const handlePriceFilter = () => {
    updateURL({
      min_price: priceRange.min || null,
      max_price: priceRange.max || null
    });
  };

  // Clear filters
  const clearFilters = () => {
    router.push(window.location.pathname);
    setPriceRange({ min: '', max: '' });
  };

  // Check active filters
  const hasActiveFilters = () => {
    return Array.from(searchParams.keys()).some(key => 
      key.startsWith('attr_') || 
      key === 'min_price' || 
      key === 'max_price' || 
      key === 'in_stock' || 
      key === 'category'
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-32 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-red-100">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button 
            onClick={fetchFilters}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg sticky top-6 z-10 max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фильтры ({Array.from(searchParams.keys()).filter(k => k.startsWith('attr_')).length} активных)
          </h3>
          {hasActiveFilters() && (
            <button 
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 hover:underline transition font-medium flex items-center gap-1 group"
            >
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Сбросить все
            </button>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto custom-scrollbar">
        
        {/* 🏷️ Категории с подкатегориями */}
        {categories.length > 0 && (
          <div className="pb-6 border-b border-gray-100">
            <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 text-lg">
              🏷️ Категории
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {renderCategoryTree(categories)}
            </div>
          </div>
        )}

        {/* 💰 Цена */}
        <div className="pb-6 border-b border-gray-100">
          <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 text-lg">
            💰 Цена, ₽
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">От</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
              <span className="text-2xl text-gray-400 font-medium self-center">—</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">До</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-sm"
                  placeholder="∞"
                  min="0"
                />
              </div>
            </div>
            <button
              onClick={handlePriceFilter}
              disabled={!priceRange.min && !priceRange.max}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {priceRange.min || priceRange.max ? '🔍 Применить цену' : 'Цена не задана'}
            </button>
          </div>
        </div>

        {/* 📦 Наличие */}
        <div className="pb-6 border-b border-gray-100">
          <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2 text-lg">
            📦 Наличие
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-gray-50 transition-all cursor-pointer group">
              <input
                type="checkbox"
                checked={searchParams.get('in_stock') === 'true'}
                onChange={(e) => updateURL({ in_stock: e.target.checked ? 'true' : null })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer transition-all group-hover:scale-110"
              />
              <div>
                <div className="font-semibold text-gray-900">В наличии</div>
                <div className="text-sm text-gray-600">Только товары со stock > 0</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-gray-50 transition-all cursor-pointer group">
              <input
                type="checkbox"
                checked={searchParams.get('made_to_order') === 'true'}
                onChange={(e) => updateURL({ made_to_order: e.target.checked ? 'true' : null })}
                className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all group-hover:scale-110"
              />
              <div>
                <div className="font-semibold text-blue-800">Под заказ</div>
                <div className="text-sm text-blue-600">made_to_order</div>
              </div>
            </label>
          </div>
        </div>

        {/* 🎨 Характеристики */}
        {attributes.length > 0 && (
          <div>
            <h4 className="font-semibold mb-6 text-gray-900 flex items-center gap-2 text-lg">
              🎨 Характеристики ({attributes.reduce((acc, attr) => acc + getSelectedCount(attr.slug), 0)} выбрано)
            </h4>
            <div className="space-y-4">
              {attributes.map((attr) => {
                const selectedCount = getSelectedCount(attr.slug);
                return (
                  <div key={attr.id} className="group border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                        {attr.name}
                        {selectedCount > 0 && (
                          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[1.5rem] text-center">
                            {selectedCount}
                          </span>
                        )}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {attr.values?.length || 0} вариантов
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {attr.values?.map((value) => {
                        const isActive = isValueSelected(attr.slug, value.id);
                        return (
                          <label 
                            key={value.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group/row hover:bg-gray-50 ${
                              isActive 
                                ? 'bg-gradient-to-r from-primary/10 to-blue-100 border-2 border-primary shadow-sm scale-[1.02]' 
                                : 'border border-gray-200 hover:border-primary hover:shadow-sm'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleFilterChange(attr.slug, value.id)}
                              className={`w-5 h-5 rounded cursor-pointer transition-all ${
                                isActive 
                                  ? 'text-primary border-2 border-primary shadow-sm' 
                                  : 'text-gray-600 border-gray-300 group-hover/row:border-primary'
                              }`}
                            />
                            
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {value.color_code && (
                                <div
                                  className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0"
                                  style={{ backgroundColor: value.color_code }}
                                  title={value.value}
                                />
                              )}
                              <span className={`truncate text-sm font-medium ${
                                isActive ? 'text-gray-900 font-semibold' : 'text-gray-700'
                              }`}>
                                {value.value}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
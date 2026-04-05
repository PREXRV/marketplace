'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Attribute, Category } from '@/lib/api';

interface ProductFiltersProps {
  categorySlug?: string;
}

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}

function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function ProductFilters({ categorySlug }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('min_price') || '',
    max: searchParams.get('max_price') || '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      setError(null);

      const [attributesData, categoriesData] = await Promise.all([
        api.getAttributes(categorySlug),
        api.getCategories(),
      ]);

      setAttributes(Array.isArray(attributesData) ? attributesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('❌ Ошибка загрузки фильтров:', error);
      setError(error?.message || 'Не удалось загрузить фильтры');
      setAttributes([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, [categorySlug]);

  useEffect(() => {
    setPriceRange({
      min: searchParams.get('min_price') || '',
      max: searchParams.get('max_price') || '',
    });
  }, [searchParams]);

  const categoryTree = useMemo(() => {
    const map = new Map<number, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    categories.forEach((category) => {
      map.set(category.id, {
        ...category,
        children: [],
        level: 0,
      });
    });

    categories.forEach((category) => {
      const node = map.get(category.id);
      if (!node) return;

      const parentId =
        typeof category.parent === 'object' && category.parent
          ? category.parent.id
          : (category.parent as number | null);

      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [categories]);

  const updateURL = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    router.push(query ? `?${query}` : window.location.pathname);
  };

  const handleFilterChange = (attrSlug: string, valueId: number) => {
    const key = `attr_${attrSlug}`;
    const currentValue = searchParams.get(key);

    let selectedValues = currentValue ? currentValue.split(',').map(Number) : [];

    if (selectedValues.includes(valueId)) {
      selectedValues = selectedValues.filter((id) => id !== valueId);
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

    return currentValue.split(',').map(Number).includes(valueId);
  };

  const getSelectedCount = (attrSlug: string): number => {
    const key = `attr_${attrSlug}`;
    const currentValue = searchParams.get(key);
    return currentValue ? currentValue.split(',').length : 0;
  };

  const handlePriceFilter = () => {
    updateURL({
      min_price: priceRange.min || null,
      max_price: priceRange.max || null,
    });
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = () => {
    return Array.from(searchParams.keys()).some(
      (key) =>
        key.startsWith('attr_') ||
        key === 'min_price' ||
        key === 'max_price' ||
        key === 'availability' ||
        key === 'category'
    );
  };

  const activeCategoryId = searchParams.get('category');
  const activeAvailability = searchParams.get('availability');

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const renderCategoryNode = (category: CategoryTreeNode) => {
    const isActive = activeCategoryId === String(category.id);
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 rounded-xl border transition-all ${
            isActive
              ? 'border-primary bg-blue-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${category.level * 14}px` }}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label={isExpanded ? 'Свернуть подкатегории' : 'Развернуть подкатегории'}
            >
              {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </button>
          )}

          {!hasChildren && <span className="ml-3 w-2 h-2 rounded-full bg-gray-300" />}

          <button
            type="button"
            onClick={() => updateURL({ category: String(category.id) })}
            className={`flex-1 text-left px-3 py-3 text-sm font-medium rounded-xl ${
              isActive ? 'text-primary' : 'text-gray-700'
            }`}
          >
            {category.name}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children.map((child) => renderCategoryNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-28 mb-4" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg sticky top-4 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
        <div className="flex justify-between items-center gap-3">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фильтры
          </h3>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 hover:underline transition font-medium"
            >
              Сбросить
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {categoryTree.length > 0 && (
          <div className="pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Категории</h4>
              {activeCategoryId && (
                <button
                  type="button"
                  onClick={() => updateURL({ category: null })}
                  className="text-xs text-primary hover:underline"
                >
                  Показать все
                </button>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => updateURL({ category: null })}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium border ${
                  !activeCategoryId
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white border-transparent shadow-md'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                Все категории
              </button>

              <div className="space-y-2">
                {categoryTree.map((category) => renderCategoryNode(category))}
              </div>
            </div>
          </div>
        )}

        <div className="pb-6 border-b border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-900">Цена, ₽</h4>
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="От"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                min="0"
              />
              <span className="text-gray-400 font-medium">—</span>
              <input
                type="number"
                placeholder="До"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                min="0"
              />
            </div>

            <button
              onClick={handlePriceFilter}
              disabled={!priceRange.min && !priceRange.max}
              className="w-full bg-primary text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium text-sm"
            >
              Применить
            </button>
          </div>
        </div>

        <div className="pb-6 border-b border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-900">Статус товара</h4>
          <div className="space-y-2">
            {[
              { value: null, label: 'Все статусы', cls: 'bg-gray-50 text-gray-700 border-gray-200' },
              { value: 'in_stock', label: 'В наличии', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { value: 'made_to_order', label: 'Под заказ', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
              { value: 'can_order', label: 'Можно заказать', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
              { value: 'out_of_stock', label: 'Нет в наличии', cls: 'bg-red-50 text-red-600 border-red-200' },
            ].map((item) => {
              const isActive = (activeAvailability || null) === item.value;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => updateURL({ availability: item.value })}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? 'ring-2 ring-primary shadow-sm'
                      : 'hover:shadow-sm'
                  } ${item.cls}`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {Array.isArray(attributes) &&
          attributes.length > 0 &&
          attributes.map((attr) => {
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
                  {Array.isArray(attr.values) &&
                    attr.values.map((value) => {
                      const isActive = isValueSelected(attr.slug, value.id);

                      return (
                        <label
                          key={value.id}
                          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition border ${
                            isActive
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'hover:bg-gray-50 border-transparent'
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
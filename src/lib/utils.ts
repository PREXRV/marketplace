/**
 * Утилиты для работы со строками и данными
 */

/**
 * Получить инициалы из имени пользователя
 * @param name - Имя пользователя (может быть null/undefined)
 * @returns Инициалы (например: "Иван Петров" → "ИП", "prexrv" → "PR")
 */
export const getInitials = (name?: string | null): string => {
  // Защита от null/undefined/пустой строки
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return 'AN'; // Аноним
  }
  
  try {
    const parts = name.trim().split(/\s+/); // Разделение по пробелам
    
    if (parts.length === 1) {
      // Одно слово: берем первые 2 буквы
      return parts[0].slice(0, 2).toUpperCase();
    }
    
    // Несколько слов: берем первые буквы первых двух слов
    return parts
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  } catch (e) {
    console.error('getInitials error:', e);
    return 'AN';
  }
};

/**
 * Форматирование цены
 * @param price - Цена в числовом формате
 * @returns Отформатированная цена (например: "1 999 ₽")
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Склонение числительных
 * @param count - Число
 * @param forms - Массив форм [1, 2, 5] (например: ['товар', 'товара', 'товаров'])
 * @returns Правильная форма слова
 */
export const pluralize = (count: number, forms: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
};

/**
 * Обрезать текст до указанной длины
 * @param text - Исходный текст
 * @param maxLength - Максимальная длина
 * @returns Обрезанный текст с многоточием
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Проверка валидности email
 * @param email - Email адрес
 * @returns true если валидный
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Генерация случайного ID
 * @returns Случайная строка
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Debounce функция
 * @param func - Функция для вызова
 * @param wait - Задержка в миллисекундах
 * @returns Debounced функция
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

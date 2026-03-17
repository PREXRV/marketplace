'use client';

import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'your-secret-key-change-in-production';

export const secureStorage = {
  /**
   * Сохранить данные с шифрованием
   */
  setItem: (key: string, value: any): void => {
    try {
      const stringValue = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringValue, SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Ошибка сохранения данных:', error);
    }
  },

  /**
   * Получить расшифрованные данные
   */
  getItem: <T = any>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Ошибка чтения данных:', error);
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Удалить данные
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * Очистить все данные
   */
  clear: (): void => {
    localStorage.clear();
  }
};

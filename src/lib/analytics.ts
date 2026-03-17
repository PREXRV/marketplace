'use client';

interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (counterId: number, action: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';
const YM_COUNTER_ID = parseInt(process.env.NEXT_PUBLIC_YM_ID || '0');

export const analytics = {
  /**
   * Инициализация Google Analytics
   */
  initGA: () => {
    if (!GA_MEASUREMENT_ID) return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);
  },

  /**
   * Инициализация Яндекс.Метрики
   */
  initYM: () => {
    if (!YM_COUNTER_ID) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      
      ym(${YM_COUNTER_ID}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true,
        ecommerce:"dataLayer"
      });
    `;
    document.head.appendChild(script);
  },

  /**
   * Отслеживание события
   */
  trackEvent: ({ event, category, label, value, ...params }: AnalyticsEvent) => {
    // Google Analytics
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('event', event, {
        event_category: category,
        event_label: label,
        value: value,
        ...params,
      });
    }

    // Яндекс.Метрика
    if (window.ym && YM_COUNTER_ID) {
      window.ym(YM_COUNTER_ID, 'reachGoal', event, params);
    }

    console.log('📊 Analytics Event:', { event, category, label, value, params });
  },

  /**
   * Просмотр страницы
   */
  pageView: (url: string, title?: string) => {
    if (window.gtag && GA_MEASUREMENT_ID) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
        page_title: title,
      });
    }

    if (window.ym && YM_COUNTER_ID) {
      window.ym(YM_COUNTER_ID, 'hit', url);
    }
  },

  /**
   * Просмотр товара
   */
  viewProduct: (product: any) => {
    analytics.trackEvent({
      event: 'view_item',
      category: 'ecommerce',
      ecommerce: {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: parseFloat(product.final_price || product.price),
          item_category: product.category_name,
        }]
      }
    });
  },

  /**
   * Добавление в корзину
   */
  addToCart: (product: any, quantity: number = 1) => {
    analytics.trackEvent({
      event: 'add_to_cart',
      category: 'ecommerce',
      value: parseFloat(product.price) * quantity,
      currency: 'RUB',
      ecommerce: {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: parseFloat(product.price),
          quantity: quantity,
        }]
      }
    });
  },

  /**
   * Начало оформления заказа
   */
  beginCheckout: (cart: any[], total: number) => {
    analytics.trackEvent({
      event: 'begin_checkout',
      category: 'ecommerce',
      value: total,
      currency: 'RUB',
      ecommerce: {
        items: cart.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      }
    });
  },

  /**
   * Покупка
   */
  purchase: (orderId: string, total: number, items: any[]) => {
    analytics.trackEvent({
      event: 'purchase',
      category: 'ecommerce',
      transaction_id: orderId,
      value: total,
      currency: 'RUB',
      ecommerce: {
        transaction_id: orderId,
        value: total,
        currency: 'RUB',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      }
    });
  },

  /**
   * Применение промокода
   */
  applyPromoCode: (code: string, discount: number) => {
    analytics.trackEvent({
      event: 'apply_promo_code',
      category: 'promotion',
      label: code,
      value: discount,
    });
  },

  /**
   * Клик по кнопке
   */
  buttonClick: (buttonName: string, location: string) => {
    analytics.trackEvent({
      event: 'button_click',
      category: 'engagement',
      label: buttonName,
      location: location,
    });
  },
};

export default analytics;

'use client';

import { useState, useEffect, useRef } from 'react';
import { partnershipAPI } from '@/services/api';
import {
  TrendingUp, TrendingDown, Eye, Video,
  DollarSign, ShoppingCart, RefreshCw
} from 'lucide-react';

const PERIODS = [
  { label: '7 дней',  value: 7  },
  { label: '30 дней', value: 30 },
  { label: '90 дней', value: 90 },
];

const METRICS = [
  { key: 'views',     label: 'Просмотры',  color: '#9333ea', bg: 'bg-purple-100', text: 'text-purple-700' },
  { key: 'cart',      label: 'Корзина',    color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
  { key: 'purchases', label: 'Покупки',    color: '#22c55e', bg: 'bg-green-100',  text: 'text-green-700'  },
];

interface DayStat {
  date: string;
  views: number;
  cart: number;
  purchases: number;
  videos: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics]       = useState<any>(null);
  const [loading, setLoading]            = useState(true);
  const [refreshing, setRefreshing]      = useState(false);
  const [period, setPeriod]              = useState(30);
  const [activeMetrics, setActiveMetrics] = useState<string[]>(['views', 'cart', 'purchases']);
  const [tooltip, setTooltip]            = useState<{ index: number } | null>(null);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await partnershipAPI.getAnalytics(period);
      setAnalytics(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleMetric = (key: string) => {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter(m => m !== key) : prev
        : [...prev, key]
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  );

  if (!analytics) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-xl text-gray-500">Нет данных</p>
      <button onClick={fetchAnalytics} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Повторить</button>
    </div>
  );

  const dailyStats: DayStat[] = Array.isArray(analytics.daily_stats)
    ? [...analytics.daily_stats].reverse()
    : [];

  // SVG размеры
  const W = 800, H = 200;
  const PAD = { top: 20, right: 20, bottom: 30, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = dailyStats.length;

  // Максимум по активным метрикам
  const maxVal = Math.max(
    ...dailyStats.flatMap(d =>
      activeMetrics.map(m => (d as any)[m] ?? 0)
    ), 1
  );

  const getPoints = (key: string) =>
    dailyStats.map((d, i) => ({
      x: PAD.left + (i / Math.max(n - 1, 1)) * chartW,
      y: PAD.top + chartH - (((d as any)[key] ?? 0) / maxVal) * chartH,
      val: (d as any)[key] ?? 0,
    }));

  const toPolyline = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x},${p.y}`).join(' ');

  const toArea = (pts: { x: number; y: number }[]) =>
    pts.length === 0 ? '' :
    `M${pts[0].x},${PAD.top + chartH} ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${PAD.top + chartH} Z`;

  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(r => ({
    y: PAD.top + chartH - r * chartH,
    val: Math.round(maxVal * r),
  }));

  const step = Math.ceil(n / 6);
  const xLabels = dailyStats
    .map((d, i) => ({ i, d }))
    .filter(({ i }) => i % step === 0 || i === n - 1);

  const growthRate = analytics.growth_rate ?? 0;

  const statCards = [
    { icon: Eye,          label: 'Просмотры',        value: (analytics.total_views ?? 0).toLocaleString(),   color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Video,        label: 'Видео',             value: analytics.total_videos ?? 0,                     color: 'text-blue-600',   bg: 'bg-blue-50'   },
    { icon: DollarSign,   label: 'Заработано',        value: `${(analytics.total_revenue ?? 0).toLocaleString()} ₽`, color: 'text-green-600',  bg: 'bg-green-50'  },
    { icon: ShoppingCart, label: 'Покупки по ссылке', value: analytics.total_purchases ?? 0,                  color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* Заголовок */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">📊 Аналитика</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 text-sm font-medium transition ${period === p.value ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchAnalytics} disabled={refreshing}
            className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Карточки */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-gray-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Рост */}
      <div className={`rounded-2xl p-5 shadow-sm flex items-center gap-4 ${growthRate >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
        {growthRate >= 0
          ? <TrendingUp  className="w-8 h-8 text-green-600 flex-shrink-0" />
          : <TrendingDown className="w-8 h-8 text-red-600 flex-shrink-0" />}
        <div>
          <p className="text-sm text-gray-500">Рост просмотров за период</p>
          <p className={`text-3xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* ─── График ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold">
            График за {PERIODS.find(p => p.value === period)?.label}
          </h2>

          {/* Переключатели метрик */}
          <div className="flex gap-2">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  activeMetrics.includes(m.key)
                    ? `${m.bg} ${m.text} border-transparent`
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: activeMetrics.includes(m.key) ? m.color : '#d1d5db' }}
                />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tooltip над графиком */}
        {tooltip !== null && dailyStats[tooltip.index] && (
          <div className="flex gap-4 mb-3 text-sm flex-wrap">
            <span className="text-gray-500 font-medium">
              {new Date(dailyStats[tooltip.index].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </span>
            {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
              <span key={m.key} className={`font-semibold ${m.text}`}>
                {m.label}: {((dailyStats[tooltip.index] as any)[m.key] ?? 0).toLocaleString()}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}
            onMouseLeave={() => setTooltip(null)}>
            <defs>
              {METRICS.map(m => (
                <linearGradient key={m.key} id={`area-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={m.color} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={m.color} stopOpacity="0.01" />
                </linearGradient>
              ))}
            </defs>

            {/* Сетка Y */}
            {yLabels.map(({ y, val }) => (
              <g key={val}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            ))}

            {/* Метки X */}
            {xLabels.map(({ i, d }) => (
              <text key={i}
                x={PAD.left + (i / Math.max(n - 1, 1)) * chartW}
                y={H - 6} textAnchor="middle" fontSize="10" fill="#9ca3af">
                {new Date(d.date).getDate()}.{new Date(d.date).getMonth() + 1}
              </text>
            ))}

            {/* Линии и области */}
            {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => {
              const pts = getPoints(m.key);
              return (
                <g key={m.key}>
                  <path d={toArea(pts)} fill={`url(#area-${m.key})`} />
                  <polyline
                    points={toPolyline(pts)}
                    fill="none"
                    stroke={m.color}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* Интерактивные зоны */}
            {dailyStats.map((_, i) => {
              const x = PAD.left + (i / Math.max(n - 1, 1)) * chartW;
              const isHovered = tooltip?.index === i;
              return (
                <g key={i}>
                  <rect
                    x={x - chartW / n / 2} y={PAD.top}
                    width={chartW / n} height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setTooltip({ index: i })}
                  />
                  {isHovered && (
                    <>
                      <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + chartH}
                        stroke="#6b7280" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                      {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => {
                        const pts = getPoints(m.key);
                        return (
                          <circle key={m.key}
                            cx={pts[i].x} cy={pts[i].y} r="4"
                            fill="white" stroke={m.color} strokeWidth="2.5" />
                        );
                      })}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Топ товары */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">🏆 Топ товары</h2>
        {analytics.top_products?.length > 0 ? (
          <div className="space-y-4">
            {analytics.top_products.map((product: any, index: number) => {
              const maxV = analytics.top_products[0]?.total_views || 1;
              const pct  = Math.round((product.total_views / maxV) * 100);
              return (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-purple-600 w-6 text-center">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{product.product__name || '—'}</span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span><Eye className="w-3 h-3 inline mr-0.5" />{product.total_views.toLocaleString()}</span>
                        <span><ShoppingCart className="w-3 h-3 inline mr-0.5" />{product.purchases}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Нет данных по товарам</p>
          </div>
        )}
      </div>

    </div>
  );
}

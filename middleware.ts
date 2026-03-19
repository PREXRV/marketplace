// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/api/:path*', // Применяется ко всем API-роутам
};

export default function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // Разрешённые домены фронтенда
  const allowedOrigins = [
    'https://marketplace-beta-lovat.vercel.app',
    'http://localhost:3000',          // для локальной разработки
    'https://pearle-physiognomonical-dorsally.ngrok-free.dev', // твой ngrok туннель
  ];

  const isAllowed = origin && allowedOrigins.includes(origin);

  // Preflight запрос (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Для обычных запросов
  const response = NextResponse.next();
  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin!);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
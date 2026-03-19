// frontend/src/app/api/proxy/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization'); // токен из фронта
    const originalPath = req.nextUrl.pathname.replace('/api/proxy', ''); // реальный путь на ngrok
    const url = `https://pearle-physiognomonical-dorsally.ngrok-free.dev${originalPath}${req.nextUrl.search}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': token || '',
      },
    });

    const data = await res.json();

    const response = NextResponse.json(data);
    response.headers.set('Access-Control-Allow-Origin', '*'); // чтобы фронт не ругался
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
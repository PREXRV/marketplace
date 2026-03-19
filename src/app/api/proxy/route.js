import { NextResponse } from 'next/server';

// Универсальный proxy для всех HTTP-методов
export async function handler(req) {
  try {
    // Получаем путь к ngrok API из query или body
    const method = req.method;
    const token = req.headers.get('authorization') || '';
    
    let path = req.nextUrl.searchParams.get('path');
    let bodyData;

    if (!path && method !== 'GET') {
      const json = await req.json();
      path = json.path;
      bodyData = json.body;
    }

    if (!path) return NextResponse.json({ error: 'Path not provided' }, { status: 400 });

    const url = `https://pearle-physiognomonical-dorsally.ngrok-free.dev${path}`;

    const fetchOptions = {
      method,
      headers: { 
        Authorization: token,
        'Content-Type': 'application/json'
      }
    };

    if (bodyData) fetchOptions.body = JSON.stringify(bodyData);

    const res = await fetch(url, fetchOptions);
    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Проброс всех методов
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
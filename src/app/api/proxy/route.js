// src/app/api/proxy/route.js
import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    const token = req.headers.get('authorization'); // токен с фронта
    const path = req.nextUrl.searchParams.get('path'); // ?path=/api/...
    if (!path) return NextResponse.json({ error: 'No path provided' }, { status: 400 });

    const res = await fetch('https://pearle-physiognomonical-dorsally.ngrok-free.dev' + path, {
      headers: { Authorization: token },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    const { path, body } = await req.json();
    const token = req.headers.get('authorization');

    if (!path) return NextResponse.json({ error: 'No path provided' }, { status: 400 });

    const res = await fetch('https://pearle-physiognomonical-dorsally.ngrok-free.dev' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// Проброс всех методов
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
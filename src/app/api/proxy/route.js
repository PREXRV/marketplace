import { NextResponse } from 'next/server';

const BASE_URL = 'https://pearle-physiognomonical-dorsally.ngrok-free.dev';

// ✅ ОБЯЗАТЕЛЬНО для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req) {
  try {
    const token = req.headers.get('authorization');
    const path = req.nextUrl.searchParams.get('path');

    const res = await fetch(BASE_URL + path, {
      headers: { Authorization: token || '' },
    });

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { path, body } = await req.json();
    const token = req.headers.get('authorization');

    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
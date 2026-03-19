import { NextResponse } from 'next/server';

export async function GET(req) {
  const token = req.headers.get('authorization'); // токен из фронта
  const url = 'https://pearle-physiognomonical-dorsally.ngrok-free.dev' + req.nextUrl.search; // путь на ngrok

  const res = await fetch(url, {
    headers: { 'Authorization': token },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
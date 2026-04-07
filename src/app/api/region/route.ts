// app/api/region/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());
  
  return NextResponse.json({
    'x-vercel-id': headers['x-vercel-id'] || 'not found',
    'x-vercel-ip-country': headers['x-vercel-ip-country'] || 'not found',
    'x-vercel-ip-country-region': headers['x-vercel-ip-country-region'] || 'not found',
    'x-forwarded-for': headers['x-forwarded-for'] || 'not found',
    'user-agent': headers['user-agent'] || 'not found',
    timestamp: new Date().toISOString()
  });
}
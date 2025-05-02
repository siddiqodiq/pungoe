// app/api/scan/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();
    
    // Validasi input
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Forward request ke backend Flask
    const flaskResponse = await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      return NextResponse.json(
        { error: error || 'Failed to scan domain' },
        { status: flaskResponse.status }
      );
    }

    const data = await flaskResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
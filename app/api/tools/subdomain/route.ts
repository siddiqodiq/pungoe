// app/api/tools/subdomain/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();
    
    // Validasi input minimal
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { error: 'Valid domain is required' },
        { status: 400 }
      );
    }

    // Panggil backend Flask
    const flaskResponse = await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }), // Hanya kirim domain saja
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      return NextResponse.json(
        { error: error || 'Failed to scan domain' },
        { status: flaskResponse.status }
      );
    }

    const result = await flaskResponse.json();
    
    // Pastikan response memiliki format yang diharapkan
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from backend');
    }

    return NextResponse.json({
      success: true,
      output: result.output || result // Handle kedua kemungkinan struktur response
    });

  } catch (error) {
    console.error('Subdomain scan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
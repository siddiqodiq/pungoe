// app/api/tools/wayback-dorking/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    
    if (!target) {
      return NextResponse.json(
        { error: 'Target domain is required' },
        { status: 400 }
      );
    }

    // Forward to Flask backend
    const flaskResponse = await fetch('http://localhost:5000/api/wayback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target })
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      return NextResponse.json(
        { error: error || 'Failed to fetch Wayback URLs' },
        { status: flaskResponse.status }
      );
    }

    // Return the stream directly
    return new Response(flaskResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Wayback dorking error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
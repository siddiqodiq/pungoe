// app/api/tools/url-fuzzer/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure dynamic handling

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const target = formData.get('target') as string;
    const file = formData.get('file') as File;

    if (!target) {
      return new Response('Target URL is required', { status: 400 });
    }

    if (!target.includes('FUZZ')) {
      return new Response('Target URL must contain "FUZZ" placeholder', { status: 400 });
    }

    if (!file) {
      return new Response('Wordlist file is required', { status: 400 });
    }

    // Forward to Flask backend
    const flaskFormData = new FormData();
    flaskFormData.append('target', target);
    flaskFormData.append('file', file);

    const flaskResponse = await fetch('http://localhost:5000/api/fuzz', {
      method: 'POST',
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      return new Response(error || 'Failed to start fuzzing', { status: flaskResponse.status });
    }

    // Get session ID from headers
    const sessionId = flaskResponse.headers.get('X-Session-ID');

    // Create a pass-through stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Pipe the Flask response to our response
    (async () => {
      const reader = flaskResponse.body?.getReader();
      if (!reader) {
        writer.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        writer.close();
      }
    })();

    // Return the streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Session-ID': sessionId || '',
      },
    });

  } catch (error) {
    console.error('URL Fuzzer error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response('session_id is required', { status: 400 });
    }

    const flaskResponse = await fetch('http://localhost:5000/api/fuzz/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id }),
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.json();
      return NextResponse.json(
        { error: error.error || 'Failed to stop fuzzing' },
        { status: flaskResponse.status }
      );
    }

    return NextResponse.json({ status: 'stopped' });

  } catch (error) {
    console.error('Stop fuzzing error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}
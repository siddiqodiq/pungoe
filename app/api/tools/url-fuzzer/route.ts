import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const target = formData.get('target') as string;
    const file = formData.get('file') as File;

    if (!target || !file) {
      return NextResponse.json(
        { error: 'Both target URL and wordlist file are required' },
        { status: 400 }
      );
    }

    // Handle abort signal from client
    const signal = req.signal;
    const controller = new AbortController();
    signal?.addEventListener('abort', () => controller.abort());

    // Forward to Flask backend with abort support
    const flaskFormData = new FormData();
    flaskFormData.append('target', target);
    flaskFormData.append('file', file);

    const flaskResponse = await fetch('http://localhost:5000/api/fuzz', {
      method: 'POST',
      body: flaskFormData,
      signal: controller.signal, // Pass the abort signal
    });

    if (!flaskResponse.ok) {
      const error = await flaskResponse.text();
      return NextResponse.json(
        { error: error || 'Failed to perform URL fuzzing' },
        { status: flaskResponse.status }
      );
    }

    // Return the stream with proper error handling
    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = flaskResponse.body?.getReader();
        
        try {
          while (true) {
            if (signal?.aborted) {
              throw new Error('Request aborted by client');
            }
            
            const { done, value } = await reader!.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (error) {
          if (error instanceof Error && error.message === 'Request aborted by client') {
            console.log('Fuzzing cancelled by client');
          } else {
            console.error('Stream error:', error);
          }
          controller.error(error);
        }
      },
      cancel() {
        // Cleanup when client cancels
        console.log('Client cancelled the fuzzing request');
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Fuzzing cancelled by user');
      return NextResponse.json(
        { error: 'Fuzzing cancelled by user' },
        { status: 499 } // Client Closed Request
      );
    }
    
    console.error('URL fuzzing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
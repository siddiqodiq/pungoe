// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = ollama(process.env.OLLAMA_MODEL || 'pentest-ai');

  // Add system message if not present
  if (messages[0]?.role !== 'system') {
    messages.unshift({
      role: 'system',
      content: 'You are a pentesting assistant. Analyze security tool results and provide actionable insights.'
    });
  }

  try {
    const { textStream } = await streamText({
      model,
      messages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 100


export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get the last message from the user
  const lastMessage = messages[messages.length - 1].content

  // Create a system prompt for Ollama
  const systemPrompt =
    "You are PentestAI, an advanced penetration testing assistant. You help security professionals with penetration testing tasks, vulnerability assessments, and security advice. Provide detailed, technical responses focused on cybersecurity and ethical hacking techniques."

  // Prepare the request for Ollama
  const ollama_url = process.env.OLLAMA_URL || "http://127.0.0.1:11434"
  const model = process.env.OLLAMA_MODEL || "pentest-ai"

  try {
    // Create a new ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${ollama_url}/api/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: [ // Format baru Ollama (berbasis messages)
                { role: "system", content: systemPrompt },
                { role: "user", content: lastMessage }
              ],
              stream: true,
            }),
            
          });

          if (!response.ok) {
            const error = await response.text()
            throw new Error(`Ollama API error: ${error}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("Response body is null")
          }

          // Process the stream
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value)

            // Parse the chunk as JSON
            const lines = chunk.split("\n").filter((line) => line.trim() !== "")

            // Di dalam loop pemrosesan stream:
          for (const line of lines) {
            try {
              const parsedChunk = JSON.parse(line);
              if (parsedChunk.message?.content) {
                // Format yang sesuai dengan useChat
                const data = {
                  id: Date.now().toString(), // ID unik
                  role: "assistant",
                  content: parsedChunk.message.content
                };
                const dataChunk = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(dataChunk));
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
          }

          // Send the final chunk
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Error in stream processing:", error)
          controller.error(error)
        }
      },
    })
    
    // Return the stream as a response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }

  
}
;
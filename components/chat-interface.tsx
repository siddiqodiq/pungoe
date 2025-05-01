"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Send, Loader2, Cpu, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ToolModal } from "@/components/tool-modal";
import { Message } from "@/app/types";
import { CodeBlock } from "@/components/code-block";
import Prism from 'prismjs';
import { Logo } from "@/components/ui/logo"

interface ChatInterfaceProps {
  activeTool: string | null;
}



export function ChatInterface({ activeTool }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle active tool changes
  useEffect(() => {
    if (activeTool) {
      setSelectedTool(activeTool);
      setIsToolModalOpen(true);
    }
  }, [activeTool]);

  // Process content and identify code blocks
  const processContent = useCallback((content: string) => {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
    let buffer = "";
    let inCodeBlock = false;
    let currentLanguage = "text";
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('```') && !inCodeBlock) {
        if (buffer) {
          parts.push({ type: 'text', content: buffer });
          buffer = "";
        }
        inCodeBlock = true;
        currentLanguage = line.slice(3).trim() || "text";
        continue;
      }
      
      if (line === '```' && inCodeBlock) {
        if (buffer) {
          parts.push({ type: 'code', content: buffer, language: currentLanguage });
          buffer = "";
        }
        inCodeBlock = false;
        continue;
      }
      
      buffer += line + '\n';
    }
    
    if (buffer) {
      parts.push({ 
        type: inCodeBlock ? 'code' : 'text', 
        content: buffer,
        ...(inCodeBlock ? { language: currentLanguage } : {})
      });
    }
    
    return parts;
  }, []);

  // Memoized message content renderer
  const MessageContent = ({ content }: { content: string }) => {
    const parts = processContent(content);
    
    useEffect(() => {
      // Jalankan highlight setelah komponen dirender
      Prism.highlightAll();
    }, [content]);
  
    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <CodeBlock 
                key={`code-${index}`}
                code={part.content} 
                language={part.language} 
              />
            );
          }
          return (
            <span key={`text-${index}`} className="text-gray-200">
              {part.content}
            </span>
          );
        })}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streamingRef.current) return;

    setIsLoading(true);
    streamingRef.current = true;
    const userMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let fullContent = "";
      const assistantMessageId = `assistant-${Date.now()}`;
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "", 
        id: assistantMessageId 
      }]);

      const decoder = new TextDecoder();
      
      while (streamingRef.current) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        
        // Optimized update - only modify the target message
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullContent } 
            : msg
        ));
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        id: `error-${Date.now()}`
      }]);
    } finally {
      streamingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-800 p-4 mobile-padding">
          <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-bg hover-pulse">
            <Logo className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-lg font-bold gradient-text">PentestAI Assistant</h2>
        </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 mobile-padding">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-md glass-effect p-6 rounded-lg mobile-padding">
                  <h3 className="text-xl font-bold mb-2 gradient-text mobile-text-sm">Welcome to PentestAI</h3>
                  <p className="text-gray-400 mobile-text-sm">
                    Your AI-powered penetration testing assistant. Ask questions about security testing, vulnerability
                    assessment, or use the tools sidebar to access specialized functions.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <Card
                  key={message.id}
                  className={`p-4 mobile-padding ${
                    message.role === "user"
                      ? "ml-auto bg-gray-700/20 border-gray-700/30 max-w-[80%] sm:max-w-[70%]"
                      : "bg-gray-900/50 border border-gray-800 max-w-[90%] sm:max-w-[80%]"
                  } hover-effect`}
                >
                  <div className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${message.role === "user" ? "gradient-bg" : "bg-gray-800"}`}>
                      {message.role === "user" ? (
                        <div className="h-8 w-8 rounded-full bg-white" />
                      ) : (
                        <Logo className="h-7 w-7 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mobile-text-sm">
                        {message.role === "user" ? "You" : "PentestAI"}
                      </div>
                      <div className="mt-1 text-sm mobile-text-sm">
                        <MessageContent content={message.content} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-800 p-4 mobile-padding">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about penetration testing techniques..."
                className="min-h-12 flex-1 resize-none bg-gray-800 border-gray-700 focus:border-gray-500 hover-input"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="gradient-btn hover-effect button-hover"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <ToolModal 
        toolId={selectedTool} 
        isOpen={isToolModalOpen} 
        onClose={() => setIsToolModalOpen(false)} 
      />
    </div>
  );
}
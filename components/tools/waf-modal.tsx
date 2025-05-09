"use client";
import { useState } from "react";
import { BaseToolModal } from "./base-tool-modal";
import { Tool } from "@/lib/tools";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Play, Copy, Check, Send } from "lucide-react";
import { stripAnsiCodes } from '@/utils/ansi';

interface WafModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

export function WafModal({ tool, isOpen, onClose, onSendToChat }: WafModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [copied, setCopied] = useState(false);
  const [rawOutput, setRawOutput] = useState("");

  const handleRunTool = async () => {
    if (!target) {
      setError("Target website is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/tools/waf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          domain: target.replace(/^https?:\/\//i, "").split('/')[0]
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const formattedResults = formatWafResults(data.output, target);
      setResults(formattedResults);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatWafResults = (rawOutput: string, target: string): string => {
    try {
      // Bersihkan output dari kode ANSI terlebih dahulu
      const cleanOutput = stripAnsiCodes(rawOutput);
      
      const lines = cleanOutput
        .split('\n')
        .map(line => line.trim())
        .filter(line =>
          line.startsWith('[*]') ||
          line.startsWith('[+]') ||
          line.startsWith('[-]') ||
          line.startsWith('[~]')
        );
  
      let isProtected = false;
      let wafName = 'Unknown';
      let protectedExplanation = '';
      let reason = '';
      let requests = '';
  
      for (const line of lines) {
        if (line.includes('is behind')) {
          isProtected = true;
          const wafMatch = line.match(/behind (.+?) WAF/i);
          if (wafMatch) wafName = wafMatch[1].trim(); // Tambahkan trim() untuk menghapus spasi ekstra
          protectedExplanation = 'Confirmed by signature match';
        }
  
        if (line.includes('No WAF detected')) {
          isProtected = false;
          protectedExplanation = 'No WAF detected by the generic detection';
        }
  
        if (line.includes('seems to be behind')) {
          isProtected = false;
          protectedExplanation = 'Seemingly behind a WAF or some sort of security solution';
        }
  
        if (line.startsWith('[~] Reason:')) {
          reason = line.replace('[~] Reason: ', '').trim();
        }
  
        if (line.includes('Number of requests:')) {
          requests = line.replace('[~] Number of requests: ', '').trim();
        }
      }
  
      return `WAF DETECTION RESULTS\n\n` +
        `• Target: ${target}\n` +
        `• Protected: ${isProtected ? '✅ Yes' : `❌ No (${protectedExplanation})`}\n` +
        `• WAF Name: ${wafName}\n` +
        `• Requests: ${requests || 'N/A'}` +
        (reason ? `\n• Reason: ${reason}` : '');
    } catch (err) {
      console.error('Format error:', err);
      return 'Could not format results';
    }
  };

  return (
    <BaseToolModal tool={tool} isOpen={isOpen} onClose={onClose}>
      <div className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>WAF Detector</CardTitle>
            <CardDescription>Detect if a website is behind a WAF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="target" className="text-sm font-medium">
                Target Website
              </label>
              <Input
                id="target"
                type="text"
                placeholder="example.com or https://example.com"
                value={target}
                onChange={(e) => setTarget(e.target.value.trim())}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRunTool}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Tool
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {results && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {results}
                </pre>
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(results);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  {onSendToChat && results && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onSendToChat(results)}
                      aria-label="Send to chat"
                      disabled={isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}

                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseToolModal>
  );
}
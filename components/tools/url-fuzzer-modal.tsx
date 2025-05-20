"use client";
import { useState, useRef, useEffect } from "react";
import { BaseToolModal } from "./base-tool-modal";
import { Tool } from "@/lib/tools";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Play, 
  Copy, 
  Download, 
  Check, 
  Send,
  AlertCircle,
  Search,
  StopCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface UrlFuzzerModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

export function UrlFuzzerModal({ tool, isOpen, onClose, onSendToChat }: UrlFuzzerModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [wordlistFile, setWordlistFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null); // New: AbortController ref
  const { toast } = useToast();
  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const cleanAnsiCodes = (str: string) => {
    return str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  };

  const formatResultLine = (line: string) => {
    const cleanLine = cleanAnsiCodes(line);
    const baseUrl = targetUrl.replace("FUZZ", "");
    
    const fullMatch = cleanLine.match(
      /^(.*?)\s+\[Status: (\d+), Size: (\d+)(?:, Words: \d+)?(?:, Lines: \d+)?(?:, Duration: (\d+)ms)?/
    );

    if (fullMatch) {
      const [_, payload, status, size, duration] = fullMatch;
      const parts = [
        `${baseUrl}${payload}`,
        `[Status: ${status}`,
        `Size: ${size}`,
        duration && `Duration: ${duration}ms`
      ].filter(Boolean);
      
      return parts.join(' ') + ']';
    }

    const altMatch = cleanLine.match(/^(.*?)\s+\[.*?(\d+)ms\]/);
    if (altMatch) {
      return `${baseUrl}${altMatch[1]} [Duration: ${altMatch[2]}ms]`;
    }

    return cleanLine.trim() ? `${baseUrl}${cleanLine.trim()}` : '';
  };

  const handleRunTool = async () => {
    if (!targetUrl) {
      setError("Target URL is required");
      return;
    }

    if (!targetUrl.includes("FUZZ")) {
      setError("Target URL must contain 'FUZZ' placeholder");
      return;
    }

    if (!wordlistFile) {
      setError("Wordlist file is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    abortControllerRef.current = new AbortController(); // Initialize AbortController

    try {
      const formData = new FormData();
      formData.append("target", targetUrl);
      if (wordlistFile) formData.append("file", wordlistFile);

      const response = await fetch('/api/tools/url-fuzzer', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal, // Attach abort signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to start fuzzing');
      }

      const sessionId = response.headers.get('X-Session-ID');
      setSessionId(sessionId);

      // Handle streaming text response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let accumulatedText = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        accumulatedText += textChunk;

        // Process each complete line
        const lines = accumulatedText.split('\n');
        accumulatedText = lines.pop() || ''; // Save incomplete line for next chunk

        for (const line of lines) {
          if (line.trim()) {
            const formattedLine = formatResultLine(line);
            if (formattedLine) {
              setResults(prev => [...prev, formattedLine]);
            }
          }
        }
      }

      // Process any remaining content
      if (accumulatedText.trim()) {
        const formattedLine = formatResultLine(accumulatedText);
        if (formattedLine) {
          setResults(prev => [...prev, formattedLine]);
        }
      }

      toast({
        title: "Fuzzing completed",
        description: `Found ${results.length} results for ${targetUrl}`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast({
          title: "Fuzzing cancelled",
          description: "The fuzzing process was cancelled.",
          variant: "destructive",
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        toast({
          title: "Error running tool",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setSessionId(null);
      abortControllerRef.current = null;
    }
  };

  const stopFuzzing = async () => {
    if (!sessionId) {
      toast({
        title: "No active fuzzing session",
        description: "No fuzzing session to stop.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Abort the ongoing fetch request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Send stop request to backend
      const response = await fetch('/api/tools/url-fuzzer', {
        method: 'PUT', // Match the backend route
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop fuzzing');
      }

      toast({
        title: "Fuzzing stopped",
        description: "The fuzzing process has been cancelled",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error stopping fuzzing",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSessionId(null);
      abortControllerRef.current = null;
    }
  };

  const handleCloseAttempt = () => {
    if (isLoading) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = async () => {
    if (isLoading && sessionId) {
      await stopFuzzing();
    }
    setShowConfirmClose(false);
    onClose();
  };

  const handleDownloadResults = () => {
    if (!results.length) {
      toast({
        title: "No results to download",
        description: "There are no fuzzing results to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = results.join('\n');
      const fileName = `fuzz-results-${targetUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`;

      const blob = new Blob([fileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Fuzzing results saved as text file",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not save fuzzing results",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <BaseToolModal tool={tool} isOpen={isOpen} onClose={handleCloseAttempt}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>URL Fuzzer</CardTitle>
              <CardDescription>
                Discover hidden paths and parameters by fuzzing URLs with a wordlist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  type="text"
                  placeholder="http://example.com/path?param=FUZZ"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Must include "FUZZ" placeholder where the wordlist entries should be inserted
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordlist">Wordlist File</Label>
                <Input
                  id="wordlist"
                  type="file"
                  accept=".txt,.text"
                  onChange={(e) => setWordlistFile(e.target.files?.[0] || null)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Text file containing one entry per line
                </p>
              </div>

              <Alert className="bg-gray-800/50 border-gray-700">
                <Search className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p>• The target URL must contain "FUZZ" as placeholder</p>
                  <p>• Wordlist should be a text file with one entry per line</p>
                  <p>• Example input: http://testphp.vulnweb.com/showimage.php?file=FUZZ</p>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                onClick={handleRunTool}
                disabled={isLoading || !targetUrl || !wordlistFile}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fuzzing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Fuzzing
                  </>
                )}
              </Button>
              {isLoading && (
                <Button
                  onClick={stopFuzzing}
                  variant="destructive"
                  className="flex-1"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Fuzzing
                </Button>
              )}
            </CardFooter>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fuzzing Results for {targetUrl}</CardTitle>
                <CardDescription>
                  Found {results.length} results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                    {results.map((result, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {result}
                      </div>
                    ))}
                    <div ref={resultsEndRef} />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(results.join('\n'));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      aria-label="Copy results"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleDownloadResults}
                      aria-label="Download results"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {onSendToChat && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onSendToChat(results.join('\n'))}
                        aria-label="Send to chat"
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

      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Fuzzing Process?</DialogTitle>
            <DialogDescription>
              The fuzzing process is still running. If you close now, the process will be cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Continue Fuzzing</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmClose}
            >
              Cancel and Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
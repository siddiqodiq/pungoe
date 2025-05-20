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
  FileText,
  AlertCircle,
  Send
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

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
  const [copied, setCopied] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false); // New state for dialog
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null); // New ref for AbortController
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        setFileName(file.name);
      } else {
        setError("Only .txt files are allowed");
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleRunTool = async () => {
  // Validate inputs
  if (!targetUrl) {
    setError("Target URL is required");
    return;
  }

  if (!fileName) {
    setError("Wordlist file is required");
    return;
  }

  if (!targetUrl.includes("FUZZ")) {
    setError("Target URL must contain 'FUZZ' placeholder");
    return;
  }

  // Initialize state
  setIsLoading(true);
  setError(null);
  setResults([]);
  abortControllerRef.current = new AbortController();

  try {
    const formData = new FormData();
    formData.append("target", targetUrl);
    formData.append("file", fileInputRef.current?.files?.[0] as File);

    // Start the fuzzing process
    const response = await fetch('/api/tools/url-fuzzer', {
      method: 'POST',
      body: formData,
      signal: abortControllerRef.current.signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to perform URL fuzzing');
    }

    // Process streaming response
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let accumulatedData = "";

      while (true) {
        // Check for cancellation
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedData += chunk;

        // Process complete lines
        const lines = accumulatedData.split('\n');
        accumulatedData = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            setResults(prev => [...prev, line]);
          }
        }
      }
    }

    toast({
      title: "URL Fuzzing completed",
      description: `Finished fuzzing ${targetUrl}`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Notify backend to cancel the process
      try {
        await fetch('/api/tools/url-fuzzer/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: targetUrl }),
        });
      } catch (cancelError) {
        console.error('Failed to cancel backend process:', cancelError);
      }
      
      toast({
        title: "Fuzzing cancelled",
        description: "The fuzzing process was stopped",
        variant: "default",
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
    abortControllerRef.current = null;
  }
};



  const handleDownloadResults = () => {
    if (results.length === 0) {
      toast({
        title: "No results to download",
        description: "There are no fuzzing results to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = results.join('\n');
      const fileName = `url-fuzz-results-${new Date().toISOString().slice(0, 10)}.txt`;

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

  // Fungsi untuk membatalkan proses
  const abortFuzzing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // Handler untuk penutupan modal
  const handleCloseAttempt = () => {
    if (isLoading) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  // Konfirmasi penutupan dan hentikan proses
  const confirmClose = () => {
    abortFuzzing();
    setIsLoading(false);
    setShowConfirmClose(false);
    onClose();
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Pastikan proses dihentikan saat komponen unmount
      abortFuzzing();
    };
  }, []);

  return (
    <BaseToolModal tool={tool} isOpen={isOpen} onClose={handleCloseAttempt}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>URL Fuzzer</CardTitle>
            <CardDescription>
              Discover hidden paths and files by fuzzing URLs with a wordlist
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
                placeholder="http://example.com/FUZZ (must include FUZZ)"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordlist">Wordlist File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="wordlist"
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {fileName && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1" />
                    {fileName}
                  </div>
                )}
              </div>
            </div>

            <Alert className="bg-gray-800/50 border-gray-700">
              <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
                <p>• The target URL must contain "FUZZ" as placeholder</p>
                <p>• Wordlist should be a text file with one entry per line</p>
                <p>• Example input: http://testphp.vulnweb.com/showimage.php?file=FUZZ</p>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRunTool}
              disabled={isLoading || !targetUrl || !fileName}
              className="w-full"
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
          </CardFooter>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fuzzing Results</CardTitle>
              <CardDescription>
                Found {results.length} potential paths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  {results.map((line, i) => {
                    const formattedLine = formatResultLine(line);
                    const isStatus200 = line.includes("Status: 200");
                    
                    if (isStatus200) {
                      const urlMatch = formattedLine.match(/^(.+?)\s+\[Status: 200/);
                      if (urlMatch) {
                        const url = urlMatch[1];
                        const restOfLine = formattedLine.slice(url.length);
                        return (
                          <div key={i} className="text-green-400">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-green-300"
                            >
                              {url}
                            </a>
                            {restOfLine}
                          </div>
                        );
                      }
                    }
                    
                    return (
                      <div key={i} className={isStatus200 ? "text-green-400" : ""}>
                        {formattedLine}
                      </div>
                    );
                  })}
                </pre>
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
                                            onClick={() => onSendToChat(results.map(line => formatResultLine(line)).join('\n'))}
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

      {/* Confirmation Dialog */}
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
    </BaseToolModal>
  );
}
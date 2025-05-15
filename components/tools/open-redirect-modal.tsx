"use client";
import { useState } from "react";
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
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import { 
  Loader2, 
  Play, 
  Copy, 
  Download, 
  Check,
  AlertCircle,
  Search,
  Send
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface OpenRedirectModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

export function OpenRedirectModal({ tool, isOpen, onClose, onSendToChat }: OpenRedirectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const { toast } = useToast();

  // Function to remove ANSI color codes
  const removeAnsiCodes = (text: string) => {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  };

  // Function to make URLs clickable
  const formatResultWithLinks = (text: string) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
    );
  };

  const handleRunTool = async () => {
    if (!url) {
      setError("URL is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetch('/api/tools/open-redirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to scan for open redirect');
      }

      const rawResult = await response.text();
      const cleanResult = removeAnsiCodes(rawResult);
      setResult(cleanResult);

      toast({
        title: "Open Redirect scan completed",
        description: `Scan finished for ${url}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      
      toast({
        title: "Error running tool",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAttempt = () => {
    if (isLoading) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setIsLoading(false);
    setShowConfirmClose(false);
    onClose();
  };

  const handleDownloadResults = () => {
    if (!result) {
      toast({
        title: "No results to download",
        description: "No open redirect vulnerabilities found",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = `open-redirect-scan-${new Date().toISOString().slice(0, 10)}.txt`;
      const blob = new Blob([result], { type: 'text/plain' });
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
        description: "Scan results saved as text file",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not save scan results",
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
              <CardTitle>Open Redirect Scanner</CardTitle>
              <CardDescription>
                Test URLs for open redirect vulnerabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="url">Target URL</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="http://example.com/path?param=FUZZ"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.trim())}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Example: http://testphp.vulnweb.com/redir.php?r=FUZZ
                </p>
              </div>

              <Alert className="bg-gray-800/50 border-gray-700">
                <Search className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p>• Detects unsafe redirects that could be exploited</p>
                  <p>• Useful for finding phishing vulnerabilities</p>
                  <p>• Try URLs from URL Crawler or Deep URL Crawler</p>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleRunTool}
                disabled={isLoading || !url}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Scan for Open Redirect
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Scan Results for {url}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre 
                    className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: formatResultWithLinks(result) 
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(result);
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
                        onClick={() => onSendToChat(result)}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Open Redirect Scan?</DialogTitle>
            <DialogDescription>
              The scanning process is still running. If you close now, progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Continue Scanning</Button>
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
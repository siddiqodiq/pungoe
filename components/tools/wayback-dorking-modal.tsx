// components/tools/wayback-dorking-modal.tsx
"use client";
import { useState, useEffect } from "react";
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
import {Alert} from "@/components/ui/alert";
import { 
  Loader2, 
  Play, 
  Copy, 
  Download, 
  Check, 
  Send,
  AlertCircle,
  History
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDescription } from "../ui/alert";

interface WaybackDorkingModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

export function WaybackDorkingModal({ tool, isOpen, onClose, onSendToChat }: WaybackDorkingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [copied, setCopied] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const { toast } = useToast();

  const handleRunTool = async () => {
    // Validate target doesn't contain protocol
    if (target.includes('://')) {
      setError("Please enter domain without protocol (http/https)");
      return;
    }

    if (!target) {
      setError("Target domain is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/tools/wayback-dorking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Wayback URLs');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        
        // Update results in real-time
        const newResults = fullContent.split('\n').filter(Boolean);
        setResults(newResults);
      }

      toast({
        title: "Wayback Dorking completed",
        description: `Found ${results.length} historical URLs`,
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
    if (results.length === 0) {
      toast({
        title: "No results to download",
        description: "There are no URLs to download",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileContent = results.join('\n');
      const fileName = `wayback-urls-${target}-${new Date().toISOString().slice(0, 10)}.txt`;

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
        description: "Historical URLs saved as text file",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not save URLs",
        variant: "destructive",
      });
    }
  };

  const formatResults = () => {
    if (results.length === 0) return "No historical URLs found";
    return `WAYBACK URL RESULTS (${results.length} URLs found)\n\n${results.map(url => `• ${url}`).join('\n')}`;
  };

  return (
    <>
      <BaseToolModal tool={tool} isOpen={isOpen} onClose={handleCloseAttempt}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wayback URL Dorking</CardTitle>
              <CardDescription>
                Discover historical URLs from Wayback Machine archives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="target">Target Domain</Label>
                <Input
                  id="target"
                  type="text"
                  placeholder="example.com (without http/https)"
                  value={target}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    // Remove protocol if accidentally entered
                    setTarget(value.replace(/^https?:\/\//i, ''));
                  }}
                  disabled={isLoading}
                />
              </div>

              <Alert className="bg-gray-800/50 border-gray-700">
                <History className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p>• This tool queries Wayback Machine archives</p>
                  <p>• Finds historical URLs that may reveal hidden endpoints</p>
                  <p>• Useful for passive reconnaissance</p>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleRunTool}
                disabled={isLoading || !target}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching Archives...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Wayback Dorking
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historical URLs Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                    {formatResults()}
                  </pre>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(formatResults());
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
                        onClick={() => onSendToChat(formatResults())}
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
            <DialogTitle>Cancel Wayback Search?</DialogTitle>
            <DialogDescription>
              The Wayback search is still running. If you close now, progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Continue Search</Button>
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
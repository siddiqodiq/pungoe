// components/tools/open-redirect-modal.tsx
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
  ExternalLink,
  AlertCircle,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OpenRedirectModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

interface ScanResult {
  type: string;
  vulnerableUrl: string;
  redirectedTo: string;
}

export function OpenRedirectModal({ tool, isOpen, onClose, onSendToChat }: OpenRedirectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRunTool = async () => {
    if (!url) {
      setError("URL is required");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('http://localhost:5000/api/openredirect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to scan for open redirect vulnerabilities');
      }

      const text = await response.text();
      const lines = text.split('\n');
      const foundResults: ScanResult[] = [];

      lines.forEach(line => {
        if (line.includes('[+]')) {
          const parts = line.split('->').map(part => part.trim());
          if (parts.length === 2) {
            foundResults.push({
              type: parts[0].replace('[+]', '').trim(),
              vulnerableUrl: parts[0].split(':')[1].trim(),
              redirectedTo: parts[1]
            });
          }
        }
      });

      setResults(foundResults);

      if (foundResults.length > 0) {
        toast({
          title: "Open Redirect Found",
          description: `Found ${foundResults.length} vulnerable redirect(s)`,
        });
      } else {
        toast({
          title: "No Vulnerabilities Found",
          description: "No open redirect vulnerabilities detected",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      
      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseToolModal tool={tool} isOpen={isOpen} onClose={onClose}>
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input
                id="url"
                type="text"
                placeholder="http://example.com/redir.php?r=FUZZ"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Example: http://testphp.vulnweb.com/redir.php?r=FUZZ
              </p>
            </div>

            <Alert className="bg-gray-800/50 border-gray-700">
              <Search className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <p>• URLs with parameters like redirect, url, r, next are good candidates</p>
                <p>• You can find potential URLs using our URL Crawler or Deep URL Crawler tools</p>
                <p>• The FUZZ keyword will be replaced with test payloads</p>
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

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Found {results.length} open redirect vulnerability{results.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border rounded-md bg-gray-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-500">{result.type}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Vulnerable URL:</Label>
                        <div className="p-2 bg-black rounded text-sm font-mono break-all">
                          {result.vulnerableUrl}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Redirects To:</Label>
                        <a 
                          href={result.redirectedTo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {result.redirectedTo}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BaseToolModal>
  );
}
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Send, Copy, Download, AlertTriangle, X, Check } from "lucide-react"
import { tools } from "@/lib/tools"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { runTool } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface ToolModalProps {
  toolId: string | null
  isOpen: boolean
  onClose: () => void
  onSendToChat?: (content: string) => void
}

interface ToolState {
  inputs: Record<string, string>
  results: string | null
  error: string | null
}

export function ToolModal({ toolId, isOpen, onClose, onSendToChat }: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const selectedTool = tools.find((tool) => tool.id === toolId)
  const [internalIsOpen, setInternalIsOpen] = useState(false)

   // Sync internal state with props
   useEffect(() => {
    if (isOpen) {
      setInternalIsOpen(true)
      // Reset states when opening
      setResults(null)
      setError(null)
      setInputs({})
    }
  }, [isOpen])

  const handleClose = () => {
    setInternalIsOpen(false)
    onClose()
  }

  if (!isOpen || !selectedTool) {
    return null
  }

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ 
      ...prev, 
      [id]: value.trim() 
    }));
  };

  const handleCopyResults = () => {
    if (!results) return
    
    navigator.clipboard.writeText(results)
    setCopied(true)
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    })
    
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // components/tool-modal.tsx
  const handleRunTool = async () => {
    if (!selectedTool) return;
  
    setIsLoading(true);
    setError(null);
    setResults(null);
  
    try {
      // Pastikan input yang diperlukan ada
      if (selectedTool.name === "WAF Detector" && !inputs.target) {
        throw new Error("Please enter a target website");
      }
  
      // Siapkan payload berdasarkan tool
      let payload = {};
      switch (selectedTool.name) {
        case "WAF Detector":
          payload = { 
            // Kirim kedua kemungkinan parameter untuk kompatibilitas
            url: inputs.target,
            domain: inputs.target?.replace(/^https?:\/\//i, "") 
          };
          break;
        case "Subdomain Finder":
          payload = { domain: inputs.domain };
          break;
        default:
          payload = inputs;
      }
  
      // Eksekusi tool
      const response = await runTool(selectedTool.name, payload);
      
      // Format hasil
      const formattedResults = selectedTool.name === "WAF Detector" 
        ? formatWafResults(response.output) 
        : formatSubdomainResults(response.output);
      
      setResults(formattedResults);
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSubdomainResults = (rawOutput: string) => {
    const subdomains = rawOutput.split('\n').filter(s => s.trim())
    return `SUBDOMAIN FINDER RESULTS\n\n${subdomains.map(s => `• ${s}`).join('\n')}\n\nFound ${subdomains.length} subdomains`
  }

  

  const getToolInputs = () => {
    switch (selectedTool?.name) {
      case "WAF Detector":
        return [{
          id: "target",
          label: "Target Website",
          type: "text",
          placeholder: "example.com atau https://example.com",
          required: true
        }];
      case "Subdomain Finder":
        return [{
          id: "domain",
          label: "Domain",
          type: "text",
          placeholder: "example.com",
          required: true
        }];
      default:
        return [];
    }
  };

  const stripAnsi = (str: string) => str.replace(/\x1B\[[0-9;]*m/g, '');

const formatWafResults = (rawOutput: string, target: string) => {
  try {
    const lines = rawOutput
      .split('\n')
      .map(line => stripAnsi(line.trim()))
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
        if (wafMatch) wafName = wafMatch[1];
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
        reason = line.replace('[~] Reason: ', '');
      }

      if (line.includes('Number of requests:')) {
        requests = line.replace('[~] Number of requests: ', '');
      }
    }

    const result = `WAF DETECTION RESULTS
Protected: ${isProtected ? '✅ Yes' : `❌ No (${protectedExplanation})`}
WAF Name: ${isProtected ? wafName : 'Unknown'}
Requests Made: ${requests || 'N/A'}`;

    return reason && protectedExplanation.includes('Seemingly behind')
      ? `${result}\nReason: ${reason}`
      : result;
  } catch (err) {
    console.error('Format error:', err);
    return 'Could not format results';
  }
};

  
  
  
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      case "Under Development":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "Maintenance":
        return "bg-red-500/20 text-red-500 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50"
    }
  }

  return (
    <Modal 
      open={internalIsOpen}
      onClose={handleClose}
      closeOnOutsideClick={true}
    >
      <div className="flex flex-col max-h-[80vh] w-full">
        <div className="border-b border-gray-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold gradient-text">{selectedTool.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{selectedTool.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(selectedTool.status)}`}>
              {selectedTool.status}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="tool" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tool">Tool</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>

            <TabsContent value="tool" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Configuration</CardTitle>
                  <CardDescription>Configure the parameters for this tool</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTool.status !== "Available" && (
                    <div className="flex items-center p-3 mb-4 rounded-md bg-yellow-500/10 border border-yellow-500/30">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <p className="text-sm text-yellow-500">
                        This tool is currently {selectedTool.status.toLowerCase()}. Some features may not be available.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center p-3 mb-4 rounded-md bg-red-500/10 border border-red-500/30">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  {getToolInputs().map((input) => (
                    <div key={input.id} className="space-y-2">
                      <label htmlFor={input.id} className="text-sm font-medium">
                        {input.label}
                      </label>
                      <Input
                        id={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        value={inputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        disabled={selectedTool.status !== "Available"}
                        className="bg-gray-800 border-gray-700 focus:border-gray-500"
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleRunTool}
                    disabled={isLoading || selectedTool.status !== "Available"}
                    className={`w-full ${selectedTool.status === "Available" ? "gradient-btn" : ""}`}
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
                <Card>
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
                          onClick={handleCopyResults}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        {onSendToChat && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onSendToChat(results)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="help" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Documentation</CardTitle>
                  <CardDescription>Learn how to use this tool effectively</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">About {selectedTool.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedTool.description} This tool helps you perform {selectedTool.name.toLowerCase()}{" "}
                      operations as part of your penetration testing workflow.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Usage Instructions</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-400 mt-1 space-y-1">
                      <li>Configure the tool parameters in the Tool tab</li>
                      <li>Click "Run Tool" to execute the operation</li>
                      <li>View the results below the configuration</li>
                      <li>Save or copy the results as needed</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Modal>
  )
}
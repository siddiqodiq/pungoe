"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Save, Copy, Download, AlertTriangle, X, Check } from "lucide-react"
import { tools } from "@/lib/tools"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { runTool } from "@/lib/api";

interface ToolModalProps {
  toolId: string | null
  isOpen: boolean
  onClose: () => void
}

// Type untuk menyimpan state setiap tool
interface ToolState {
  inputs: Record<string, string>
  results: string | null
  error: string | null
}

export function ToolModal({ toolId, isOpen, onClose }: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [showCopiedAlert, setShowCopiedAlert] = useState(false);

  const selectedTool = tools.find((tool) => tool.id === toolId);

  if (!isOpen || !selectedTool) {
    return null;
  }
  
  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleCopyResults = () => {
    if (!results) return;
    
    navigator.clipboard.writeText(results);
    setCopied(true);
    setShowCopiedAlert(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    setTimeout(() => {
      setShowCopiedAlert(false);
    }, 3000);
  };

  const handleRunTool = async () => {
    if (selectedTool.status !== "Available") return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await runTool(selectedTool.name, inputs);
      
      let formattedResults = response.output;
      
      if (selectedTool.name === "Subdomain Finder") {
        formattedResults = formatSubdomainResults(response.output);
      } else if (selectedTool.name === "WAF Detector") {
        formattedResults = formatWafResults(response.output);
      }
      
      setResults(formattedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run tool");
      console.error("Tool execution error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  const formatSubdomainResults = (rawOutput: string) => {
    const subdomains = rawOutput.split('\n').filter(s => s.trim());
    return `SUBDOMAIN FINDER RESULTS\n\n${subdomains.map(s => `• ${s}`).join('\n')}\n\nFound ${subdomains.length} subdomains`;
  };

  const formatWafResults = (rawOutput: string) => {
    // Parse WAFW00F output
    const wafDetected = rawOutput.includes("is behind a WAF");
    const wafNameMatch = rawOutput.match(/WAF: (.+)/);
    const wafName = wafNameMatch ? wafNameMatch[1] : "Unknown";
    
    return `WAF DETECTION RESULTS\n\n• Target: ${inputs.domain || ''}\n• WAF Detected: ${wafDetected ? "Yes" : "No"}\n• WAF Name: ${wafName}`;
  };

  const getToolInputs = () => {
    switch (selectedTool.name) {
      case "Subdomain Finder":
        return [
          { id: "domain", label: "Domain", type: "text", placeholder: "example.com" },
          { id: "depth", label: "Search Depth", type: "text", placeholder: "Standard" },
        ]
      case "Port Scanner":
        return [
          { id: "target", label: "Target IP/Domain", type: "text", placeholder: "example.com or 192.168.1.1" },
          { id: "port-range", label: "Port Range", type: "text", placeholder: "1-1000" },
        ]
      case "WAF Detector":
        return [{ id: "target", label: "Target URL", type: "text", placeholder: "https://example.com" }]
      case "Whois Lookup":
        return [{ id: "domain", label: "Domain", type: "text", placeholder: "example.com" }]
      case "URL Fuzzer":
        return [
          { id: "base-url", label: "Base URL", type: "text", placeholder: "https://example.com/" },
          { id: "wordlist", label: "Wordlist", type: "text", placeholder: "common.txt" },
        ]
      case "Nuclei":
        return [
          { id: "target", label: "Target URL", type: "text", placeholder: "https://example.com" },
          { id: "templates", label: "Templates", type: "text", placeholder: "cves,vulnerabilities" },
        ]
      case "Nikto":
        return [{ id: "target", label: "Target URL", type: "text", placeholder: "https://example.com" }]
      case "XSS Exploiter":
        return [
          { id: "target", label: "Target URL", type: "text", placeholder: "https://example.com/vulnerable-page" },
          { id: "parameter", label: "Parameter", type: "text", placeholder: "q" },
        ]
      case "SQLi Exploiter":
        return [
          { id: "target", label: "Target URL", type: "text", placeholder: "https://example.com/login" },
          { id: "parameter", label: "Parameter", type: "text", placeholder: "username" },
        ]
      case "CVE Map":
        return [{ id: "cve-id", label: "CVE ID", type: "text", placeholder: "CVE-2021-44228" }]
      default:
        return [{ id: "target", label: "Target", type: "text", placeholder: "Enter target information" }]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
      case "Under Development":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "Maintenance":
        return "bg-red-500/20 text-red-500 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50"
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} closeOnOutsideClick={false}>
        
      <div className="flex flex-col max-h-[80vh] w-full">
        <div className="border-b border-gray-800 p-4 mobile-padding flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold gradient-text mobile-text-sm">{selectedTool.name}</h2>
            <p className="text-sm text-gray-400 mt-1 mobile-text-sm">{selectedTool.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(selectedTool.status)}`}>{selectedTool.status}</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover-effect" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 mobile-padding">
          <Tabs defaultValue="tool" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 glass-effect">
              <TabsTrigger value="tool" className="hover-effect">
                Tool
              </TabsTrigger>
              <TabsTrigger value="help" className="hover-effect">
                Help
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tool" className="space-y-4">
              <Card className="glass-effect">
                <CardHeader className="mobile-padding">
                  <CardTitle className="mobile-text-sm">Tool Configuration</CardTitle>
                  <CardDescription className="mobile-text-sm">Configure the parameters for this tool</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 mobile-padding">
                  {selectedTool.status !== "Available" && (
                    <div className="flex items-center p-3 mb-4 rounded-md bg-yellow-500/10 border border-yellow-500/30">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <p className="text-sm text-yellow-500 mobile-text-sm">
                        This tool is currently {selectedTool.status.toLowerCase()}. Some features may not be available.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center p-3 mb-4 rounded-md bg-red-500/10 border border-red-500/30">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm text-red-500 mobile-text-sm">{error}</p>
                    </div>
                  )}

                  {getToolInputs().map((input) => (
                    <div key={input.id} className="space-y-2">
                      <label htmlFor={input.id} className="text-sm font-medium mobile-text-sm">
                        {input.label}
                      </label>
                      <Input
                        id={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        value={inputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        disabled={selectedTool.status !== "Available"}
                        className="bg-gray-800 border-gray-700 focus:border-gray-500 hover-input"
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="mobile-padding">
                  <Button
                    onClick={handleRunTool}
                    disabled={isLoading || selectedTool.status !== "Available"}
                    className={`w-full ${selectedTool.status === "Available" ? "gradient-btn hover-effect" : ""}`}
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
                <Card className="glass-effect">
                  <CardHeader className="mobile-padding">
                    <CardTitle className="mobile-text-sm">Results</CardTitle>
                  </CardHeader>
                  <CardContent className="mobile-padding">
                    <div className="relative">
                      <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap mobile-text-sm">
                        {results}
                      </pre>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCopyResults}
                          className="hover-effect"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="sr-only">Copy</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="hover-effect"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                      {showCopiedAlert && (
                        <div className="absolute top-12 right-2 bg-gray-800 text-white px-3 py-1 rounded-md text-sm flex items-center shadow-lg border border-gray-700">
                          Copied ✅
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="help" className="mt-4">
              <Card className="glass-effect">
                <CardHeader className="mobile-padding">
                  <CardTitle className="mobile-text-sm">Tool Documentation</CardTitle>
                  <CardDescription className="mobile-text-sm">Learn how to use this tool effectively</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 mobile-padding">
                  <div>
                    <h3 className="text-lg font-medium mobile-text-sm">About {selectedTool.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 mobile-text-sm">
                      {selectedTool.description} This tool helps you perform {selectedTool.name.toLowerCase()}{" "}
                      operations as part of your penetration testing workflow.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mobile-text-sm">Usage Instructions</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-400 mt-1 space-y-1 mobile-text-sm">
                      <li>Configure the tool parameters in the Tool tab</li>
                      <li>Click "Run Tool" to execute the operation</li>
                      <li>View the results below the configuration</li>
                      <li>Save or copy the results as needed</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mobile-text-sm">Tips</h3>
                    <ul className="list-disc list-inside text-sm text-gray-400 mt-1 space-y-1 mobile-text-sm">
                      <li>For best results, be as specific as possible with your target information</li>
                      <li>You can integrate results with the chat by using the "Send to Chat" option</li>
                      <li>Save common configurations for reuse in future testing sessions</li>
                    </ul>
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
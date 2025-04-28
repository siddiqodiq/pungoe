"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Save, Copy, Download, AlertTriangle, X } from "lucide-react"
import { tools } from "@/lib/tools"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"

interface ToolModalProps {
  toolId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ToolModal({ toolId, isOpen, onClose }: ToolModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string | null>(null)

  // Find the selected tool
  const selectedTool = tools.find((tool) => tool.id === toolId)

  if (!toolId || !selectedTool) {
    return null
  }

  const handleRunTool = () => {
    if (selectedTool.status !== "Available") {
      return
    }

    setIsLoading(true)
    // Simulate tool execution
    setTimeout(() => {
      setResults(
        selectedTool.name === "Subdomain Finder"
          ? `SUBDOMAIN                 IP ADDRESS       STATUS\napi.example.com          203.0.113.10     200 OK\nmail.example.com         203.0.113.11     200 OK\nstaging.example.com      203.0.113.12     401 Unauthorized\ndev.example.com          203.0.113.13     403 Forbidden\n\nFound 4 subdomains for example.com`
          : selectedTool.name === "Port Scanner"
            ? `PORT     STATE    SERVICE\n22/tcp   open     ssh\n80/tcp   open     http\n443/tcp  open     https\n3306/tcp closed   mysql\n\nHost appears to be running a web server and SSH.`
            : `Tool execution completed. Results for ${selectedTool.name} would appear here in a real implementation.`,
      )
      setIsLoading(false)
    }, 2000)
  }

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

                  {getToolInputs().map((input) => (
                    <div key={input.id} className="space-y-2">
                      <label htmlFor={input.id} className="text-sm font-medium mobile-text-sm">
                        {input.label}
                      </label>
                      {input.type === "textarea" ? (
                        <Textarea
                          id={input.id}
                          placeholder={input.placeholder}
                          className="bg-gray-800 border-gray-700 focus:border-gray-500 hover-input"
                          disabled={selectedTool.status !== "Available"}
                        />
                      ) : (
                        <Input
                          id={input.id}
                          type={input.type}
                          placeholder={input.placeholder}
                          className="bg-gray-800 border-gray-700 focus:border-gray-500 hover-input"
                          disabled={selectedTool.status !== "Available"}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="mobile-padding flex-col items-start gap-4">
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

                  {/* Results section - now directly below the Run Tool button */}
                  {results && (
                    <div className="w-full mt-4">
                      <h3 className="text-sm font-medium mb-2">Results:</h3>
                      <div className="relative">
                        <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                          {results}
                        </pre>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-effect">
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 hover-effect">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" className="hover-effect">
                          <Save className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Save Results</span>
                        </Button>
                        <Button variant="outline" className="hover-effect">
                          <Copy className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Copy to Clipboard</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
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

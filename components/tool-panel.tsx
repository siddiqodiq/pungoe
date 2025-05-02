"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Play, Save, Copy, Download, AlertTriangle, Check } from "lucide-react"
import { tools } from "@/lib/tools"
import { Badge } from "@/components/ui/badge"

interface ToolPanelProps {
  toolId: string | null
}

export function ToolPanel({ toolId }: ToolPanelProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Find the selected tool
  const selectedTool = tools.find((tool) => tool.id === toolId)

  const handleCopy = () => {
    if (!results) return
    navigator.clipboard.writeText(results)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!toolId || !selectedTool) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">Select a tool from the sidebar to get started</p>
        </div>
      </div>
    )
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
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold glow-text">{selectedTool.name}</h2>
          <Badge className={`${getStatusColor(selectedTool.status)}`}>{selectedTool.status}</Badge>
        </div>
        <p className="text-sm text-gray-400 mt-1">{selectedTool.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-3 glass-effect">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            <Card className="glass-effect">
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

                {getToolInputs().map((input) => (
                  <div key={input.id} className="space-y-2">
                    <label htmlFor={input.id} className="text-sm font-medium">
                      {input.label}
                    </label>
                    {input.type === "textarea" ? (
                      <Textarea
                        id={input.id}
                        placeholder={input.placeholder}
                        className="bg-gray-900/70 border-gray-800 focus:border-blue-600"
                        disabled={selectedTool.status !== "Available"}
                      />
                    ) : (
                      <Input
                        id={input.id}
                        type={input.type}
                        placeholder={input.placeholder}
                        className="bg-gray-900/70 border-gray-800 focus:border-blue-600"
                        disabled={selectedTool.status !== "Available"}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleRunTool}
                  disabled={isLoading || selectedTool.status !== "Available"}
                  className={selectedTool.status === "Available" ? "glow" : ""}
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
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Tool Results</CardTitle>
                <CardDescription>Output from the tool execution</CardDescription>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="relative">
                    <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                      {results}
                    </pre>
                    <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Copy</span>
      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {selectedTool.status === "Available"
                      ? "Run the tool to see results here"
                      : `This tool is currently ${selectedTool.status.toLowerCase()} and cannot generate results`}
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" disabled={!results}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </Button>
                <Button variant="outline" disabled={!results}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="help" className="mt-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Tool Documentation</CardTitle>
                <CardDescription>Learn how to use this tool effectively</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">About {selectedTool.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedTool.description} This tool helps you perform {selectedTool.name.toLowerCase()} operations
                    as part of your penetration testing workflow.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Usage Instructions</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-400 mt-1 space-y-1">
                    <li>Configure the tool parameters in the Configuration tab</li>
                    <li>Click "Run Tool" to execute the operation</li>
                    <li>View the results in the Results tab</li>
                    <li>Save or copy the results as needed</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Tips</h3>
                  <ul className="list-disc list-inside text-sm text-gray-400 mt-1 space-y-1">
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
  )
}

// components/tools/google-dork-modal.tsx
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
  ExternalLink,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GoogleDorkModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

export function GoogleDorkModal({ tool, isOpen, onClose, onSendToChat }: GoogleDorkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [dorkResults, setDorkResults] = useState<{title: string; query: string; url: string}[]>([]);
  const { toast } = useToast();

  const generateDorks = (domain: string) => {
  const target = domain.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
  const baseDomain = target.split('.')[0];

  return [
    {
      title: "Subdomains",
      query: `site:*.${target}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:*.${target}`)}`
    },
    {
      title: "Sub-subdomains",
      query: `site:*.*.${target}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:*.*.${target}`)}`
    },
    {
      title: ".git folders",
      query: `inurl:"/.git" ${target} -github`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`inurl:"/.git" ${target} -github`)}`
    },
    {
      title: "Backup files",
      query: `site:${target} ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup`)}`
    },
    {
      title: "Exposed documents",
      query: `site:${target} ext:doc | ext:docx | ext:odt | ext:pdf | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv | filetype:doc | filetype:docx | filetype:xls | filetype:xlsx | filetype:ppt | filetype:pptx | filetype:mdb | filetype:pdf | filetype:sql | filetype:txt | filetype:rtf | filetype:csv | filetype:xml | filetype:conf | filetype:dat | filetype:ini | filetype:log | index%20of:id_rsa id_rsa.pub | filetype:py | filetype:html | filetype:sh | filetype:odt | filetype:key | filetype:sign | filetype:md | filetype:old | filetype:bin | filetype:cer | filetype:crt | filetype:pfx | filetype:crl | filetype:crs | filetype:der`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} ext:doc | ext:docx | ext:odt | ext:pdf | ext:rtf | ext:sxw | ext:psw | ext:ppt | ext:pptx | ext:pps | ext:csv | filetype:doc | filetype:docx | filetype:xls | filetype:xlsx | filetype:ppt | filetype:pptx | filetype:mdb | filetype:pdf | filetype:sql | filetype:txt | filetype:rtf | filetype:csv | filetype:xml | filetype:conf | filetype:dat | filetype:ini | filetype:log | index%20of:id_rsa id_rsa.pub | filetype:py | filetype:html | filetype:sh | filetype:odt | filetype:key | filetype:sign | filetype:md | filetype:old | filetype:bin | filetype:cer | filetype:crt | filetype:pfx | filetype:crl | filetype:crs | filetype:der`)}`
    },
    {
      title: "Confidential documents",
      query: `inurl:${target} not for distribution | confidential | "employee only" | proprietary | top secret | classified | trade secret | internal | private filetype:xls OR filetype:csv OR filetype:doc OR filetype:pdf`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`inurl:${target} not for distribution | confidential | "employee only" | proprietary | top secret | classified | trade secret | internal | private filetype:xls OR filetype:csv OR filetype:doc OR filetype:pdf`)}`
    },
    {
      title: "Config files",
      query: `site:${target} ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:env | ext:ini`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:env | ext:ini`)}`
    },
    {
      title: "Database files",
      query: `site:${target} ext:sql | ext:dbf | ext:mdb`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} ext:sql | ext:dbf | ext:mdb`)}`
    },
    {
      title: "Other files",
      query: `site:${target} intitle:index.of | ext:log | ext:php intitle:phpinfo "published by the PHP Group" | inurl:shell | inurl:backdoor | inurl:wso | inurl:cmd | shadow | passwd | boot.ini | inurl:backdoor | inurl:readme | inurl:license | inurl:install | inurl:setup | inurl:config | inurl:"/phpinfo.php" | inurl:".htaccess" | ext:swf`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} intitle:index.of | ext:log | ext:php intitle:phpinfo "published by the PHP Group" | inurl:shell | inurl:backdoor | inurl:wso | inurl:cmd | shadow | passwd | boot.ini | inurl:backdoor | inurl:readme | inurl:license | inurl:install | inurl:setup | inurl:config | inurl:"/phpinfo.php" | inurl:".htaccess" | ext:swf`)}`
    },
    {
      title: "SQL errors",
      query: `site:${target} intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near" | intext:"unexpected end of SQL command" | intext:"Warning: mysql_connect()" | intext:"Warning: mysql_query()" | intext:"Warning: pg_connect()"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} intext:"sql syntax near" | intext:"syntax error has occurred" | intext:"incorrect syntax near" | intext:"unexpected end of SQL command" | intext:"Warning: mysql_connect()" | intext:"Warning: mysql_query()" | intext:"Warning: pg_connect()"`)}`
    },
    {
      title: "PHP errors",
      query: `site:${target} "PHP Parse error" | "PHP Warning" | "PHP Error"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} "PHP Parse error" | "PHP Warning" | "PHP Error"`)}`
    },
    {
      title: "Wordpress files",
      query: `site:${target} inurl:wp-content | inurl:wp-includes`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} inurl:wp-content | inurl:wp-includes`)}`
    },
    {
      title: "Project management sites",
      query: `site:trello.com | site:*.atlassian.net "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:trello.com | site:*.atlassian.net "${target}"`)}`
    },
    {
      title: "Path traversal",
      query: `"${target}" intitle:"index of" "parent directory" | intitle:"index of" "DCIM" | intitle:"index of" "ftp" | intitle:"index of" "backup" | intitle:"index of" "mail" | intitle:"index of" "password" | intitle:"index of" "pub" | intitle:"index of" ".git"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`"${target}" intitle:"index of" "parent directory" | intitle:"index of" "DCIM" | intitle:"index of" "ftp" | intitle:"index of" "backup" | intitle:"index of" "mail" | intitle:"index of" "password" | intitle:"index of" "pub" | intitle:"index of" ".git"`)}`
    },
    {
      title: "GitHub/GitLab/Bitbucket",
      query: `site:github.com | site:gitlab.com | site:bitbucket.org "${baseDomain}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:github.com | site:gitlab.com | site:bitbucket.org "${baseDomain}"`)}`
    },
    {
      title: "Cloud buckets S3/GCP",
      query: `site:.s3.amazonaws.com | site:storage.googleapis.com | site:amazonaws.com "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:.s3.amazonaws.com | site:storage.googleapis.com | site:amazonaws.com "${target}"`)}`
    },
    {
      title: "Traefik",
      query: `intitle:traefik inurl:8080/dashboard "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`intitle:traefik inurl:8080/dashboard "${target}"`)}`
    },
    {
      title: "Jenkins",
      query: `intitle:"Dashboard [Jenkins]" "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`intitle:"Dashboard [Jenkins]" "${target}"`)}`
    },
    {
      title: "Login pages",
      query: `site:${target} inurl:signup | inurl:register | intitle:Signup | inurl:admin | inurl:login | inurl:adminlogin | inurl:cplogin | inurl:weblogin | inurl:quicklogin | inurl:wp-admin | inurl:wp-login | inurl:portal | inurl:userportal | inurl:loginpanel | inurl:memberlogin | inurl:remote | inurl:dashboard | inurl:auth | inurl:exchange | inurl:ForgotPassword | inurl:test`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} inurl:signup | inurl:register | intitle:Signup | inurl:admin | inurl:login | inurl:adminlogin | inurl:cplogin | inurl:weblogin | inurl:quicklogin | inurl:wp-admin | inurl:wp-login | inurl:portal | inurl:userportal | inurl:loginpanel | inurl:memberlogin | inurl:remote | inurl:dashboard | inurl:auth | inurl:exchange | inurl:ForgotPassword | inurl:test`)}`
    },
    {
      title: "Open redirects",
      query: `site:${target} inurl:redir | inurl:url | inurl:redirect | inurl:return | inurl:src=http | inurl:r=http`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} inurl:redir | inurl:url | inurl:redirect | inurl:return | inurl:src=http | inurl:r=http`)}`
    },
    {
      title: "Code share sites",
      query: `site:sharecode.io | site:controlc.com | site:codepad.co | site:ideone.com | site:codebeautify.org | site:jsdelivr.com | site:codeshare.io | site:codepen.io | site:repl.it | site:jsfiddle.net "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:sharecode.io | site:controlc.com | site:codepad.co | site:ideone.com | site:codebeautify.org | site:jsdelivr.com | site:codeshare.io | site:codepen.io | site:repl.it | site:jsfiddle.net "${target}"`)}`
    },
    {
      title: "Other 3rd parties sites",
      query: `site:gitter.im | site:papaly.com | site:productforums.google.com | site:coggle.it | site:replt.it | site:ycombinator.com | site:libraries.io | site:npm.runkit.com | site:npmjs.com | site:scribd.com "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:gitter.im | site:papaly.com | site:productforums.google.com | site:coggle.it | site:replt.it | site:ycombinator.com | site:libraries.io | site:npm.runkit.com | site:npmjs.com | site:scribd.com "${target}"`)}`
    },
    {
      title: "Stackoverflow references",
      query: `site:stackoverflow.com "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:stackoverflow.com "${target}"`)}`
    },
    {
      title: "Pastebin-like sites",
      query: `site:justpaste.it | site:heypasteit.com | site:pastebin.com "${target}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:justpaste.it | site:heypasteit.com | site:pastebin.com "${target}"`)}`
    },
    {
      title: "Apache Struts RCE",
      query: `site:${target} ext:action | ext:struts | ext:do`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:${target} ext:action | ext:struts | ext:do`)}`
    },
    {
      title: "Linkedin employees",
      query: `site:linkedin.com employees ${target}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com employees ${target}`)}`
    }
  ];
};

  const handleRunTool = async () => {
    if (!domain) {
      toast({
        title: "Domain is required",
        description: "Please enter a domain or keyword to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = generateDorks(domain);
      setDorkResults(results);
      
      toast({
        title: "Google Dorks generated",
        description: `Created ${results.length} search queries for ${domain}`,
      });
    } catch (error) {
      toast({
        title: "Error generating dorks",
        description: "An error occurred while creating the search queries",
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
            <CardTitle>Google Dork Generator</CardTitle>
            <CardDescription>
              Generate specialized Google search queries to find sensitive information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain or Keyword</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com or company name"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Alert className="bg-gray-800/50 border-gray-700">
              <Search className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <p>• Powerful search queries to find hidden information</p>
                <p>• Discover exposed files, directories, and sensitive data</p>
                <p>• Useful for reconnaissance and security research</p>
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleRunTool}
              disabled={isLoading || !domain}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Dork Queries
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {dorkResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Dork Queries for {domain}</CardTitle>
              <CardDescription className="text-xs">
                Click on any link to open the Google search in a new tab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dorkResults.map((dork, index) => (
                  <div key={index} className="p-3 border rounded-md hover:bg-gray-800/50 transition-colors">
                    <h3 className="font-medium">{dork.title}</h3>
                    <p className="text-xs text-gray-400 mb-2 font-mono">{dork.query}</p>
                    <a 
                      href={dork.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open in Google
                    </a>
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
export interface Tool {
  id: string
  name: string
  description: string
  category: string
  status: string
}

export const tools: Tool[] = [
  {
    id: "4",
    name: "Whois Lookup",
    description: "Perform a WHOIS lookup for a domain.",
    category: "recon",
    status: "Available",
  },
  {
    id: "1",
    name: "Subdomain Finder",
    description: "Find subdomains of a target domain.",
    category: "recon",
    status: "Available",
  },
  {
    id: "2",
    name: "Nmap Scanner",
    description: "Scan open ports on a target IP.",
    category: "recon",
    status: "Available",
  },
  {
    id: "3",
    name: "WAF Detector",
    description: "Detect if a website is behind a WAF.",
    category: "recon",
    status: "Available",
  },
  {
    id: "11",
    name: "URL Crawler [FUZZ]",
    description: "Crawl a website to find all links with fuzzing format.",
    category: "recon",
    status: "Available",
  },
  {
    id: "12",
    name: "Deep URL Crawler",
    description: "Crawl a website using katana to find all juicy endpoints.",
    category: "recon",
    status: "Available",
  },
 
  {
    id: "5",
    name: "URL Fuzzer",
    description: "Fuzz URLs to discover hidden paths.",
    category: "exploit",
    status: "Under Development",
  },
  {
    id: "6",
    name: "Nuclei",
    description: "Fast and customizable vulnerability scanner.",
    category: "vulnerability",
    status: "Under Development",
  },
  {
    id: "7",
    name: "Nikto",
    description: "Web server vulnerability scanner.",
    category: "vulnerability",
    status: "Under Development",
  },
  {
    id: "8",
    name: "XSS Exploiter",
    description: "Exploit XSS vulnerabilities.",
    category: "exploit",
    status: "Under Development",
  },
  {
    id: "9",
    name: "SQLi Exploiter",
    description: "Exploit SQL injection vulnerabilities.",
    category: "exploit",
    status: "Under Development",
  },
  {
    id: "10",
    name: "CVSS Scoring",
    description: "Calculate CVSS score for vulnerabilities.",
    category: "utils",
    status: "Available",
  },
  {
    id: "15",
    name: "Wayback Machine Dorking",
    description: "Use the Wayback Machine to find historical data.",
    category: "recon",
    status: "Available",
  },
  {
    id: "16",
    name: "CORS Misc Scanner",
    description: "Crawl a website using katana to find all juicy endpoints.",
    category: "exploit",
    status: "Available",
  },
  {
    id: "17",
    name: "Open Redirect Exploiter",
    description: "Exploit open redirect vulnerabilities.",
    category: "exploit",
    status: "Under Development",
  },

]

export const getCategoryLabel = (category: string): string => {
  const categoryMap: Record<string, string> = {
    recon: "Reconnaissance",
    vulnerability: "Vulnerability Assessment",
    exploit: "Exploitation",
    utils: "Utilities",
  }

  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

export const getToolIcon = (toolName: string) => {
  // This function would return an appropriate icon based on the tool name
  // For now, we'll return null and handle icons in the component
  return null
}

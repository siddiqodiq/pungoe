// data/securityResources.ts
export interface SecurityResource {
  id: string
  name: string
  type: string
  entries?: string
  size: string
  filePath?: string
  sourceUrl?: string
  previewAvailable: boolean
}

export const payloadTemplates: SecurityResource[] = [
  {
    id: "PT-001",
    name: "irwanjugabro payloads",
    type: "XSS",
    size: "1 KB",
    filePath: "/resources/payloads/xssirwn.txt",
    sourceUrl: "",
    previewAvailable: true
  },
  {
    id: "PT-002",
     name: "DOS Attack Payload, for input forms to down the server",
    type: "BAC",
    size: "4.99 MB",
    filePath: "/resources/payloads/5mb.txt",
    sourceUrl: "",
    previewAvailable: true
  },
  {
    id: "PT-003",
    name: "Cloudflare WAF Bypass Payload",
    type: "XSS",
    size: "2 KB",
    filePath: "/resources/payloads/cloudflare.txt",
    sourceUrl: "",
    previewAvailable: true
  },
  {
    id: "PT-004",
    name: "Akamai WAF Bypass Payload",
    type: "XSS",
    size: "2 KB",
    filePath: "/resources/payloads/akamai.txt",
    sourceUrl: "",
    previewAvailable: true
  },
  
]

export const wordlists: SecurityResource[] = [
  {
    id: "WL-001",
    name: "Common Passwords",
    type: "Password",
    entries: "10,000",
    size: "1.2 MB",
    filePath: "/resources/wordlists/common-passwords.txt",
    sourceUrl: "https://github.com/danielmiessler/SecLists",
    previewAvailable: true
  },
  {
    id: "WL-002",
    name: "Directory Brute",
    type: "Directory",
    entries: "5,000",
    size: "500 KB",
    filePath: "/resources/wordlists/directory-brute.txt",
    sourceUrl: "https://github.com/danielmiessler/SecLists",
    previewAvailable: true
  },
  {
    id: "WL-003",
    name: "API Endpoints",
    type: "API",
    entries: "2,000",
    size: "300 KB",
    sourceUrl: "https://github.com/danielmiessler/SecLists",
    previewAvailable: false
  },
]
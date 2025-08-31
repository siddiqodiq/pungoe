import { scanSubdomains } from '../../tools/subdomain/scanner';

interface ToolResponse {
  toolName: string;
  result: any;
}

// Regex untuk mengekstrak domain
const DOMAIN_REGEX = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+)/i;

// Intent detection untuk subdomain enumeration
export function detectSubdomainIntent(message: string): boolean {
  const subdomainKeywords = [
    'find subdomains', 'search subdomains', 'list subdomains', 'enumerate subdomains',
    'subdomain enumeration', 'subdomain finder', 'subdomain discovery',
    'cari subdomain', 'temukan subdomain', 'daftar subdomain'
  ];
  
  // Check if message contains domain
  if (!DOMAIN_REGEX.test(message)) return false;
  
  // Check if message contains subdomain intent
  return subdomainKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Extract domain from message
export function extractDomain(message: string): string | null {
  const match = DOMAIN_REGEX.exec(message);
  return match ? match[1] : null;
}

// Execute appropriate tool based on intent
export async function executeAgentAction(message: string): Promise<ToolResponse | null> {
  // Check for subdomain intent
  if (detectSubdomainIntent(message)) {
    const domain = extractDomain(message);
    if (domain) {
      try {
        const result = await scanSubdomains(domain);
        return {
          toolName: 'Subdomain Enumeration',
          result
        };
      } catch (error) {
        console.error('Error executing subdomain tool:', error);
        return {
          toolName: 'Subdomain Enumeration',
          result: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }
    }
  }
  
  // No matching intent or extraction failed
  return null;
}
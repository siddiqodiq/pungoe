// app/api/tools/subdomain/scanner.ts
const kaliToolsUrl = process.env.KALI_TOOLS || "http://kali-tools:5000";
interface ScanOptions {
    bruteForce?: boolean;
    depth?: 'quick' | 'normal' | 'deep';
  }
  
  export async function scanSubdomains(domain: string, options: ScanOptions = {}) {
    const flaskResponse = await fetch(`${kaliToolsUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, ...options })
    });
  
    if (!flaskResponse.ok) {
      throw new Error(await flaskResponse.text());
    }
  
    const result = await flaskResponse.json();
    return {
      success: true,
      subdomains: result.output.split('\n').filter(Boolean),
      rawOutput: result.output
    };
  }
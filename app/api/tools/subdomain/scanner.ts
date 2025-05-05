// app/api/tools/subdomain/scanner.ts
interface ScanOptions {
    bruteForce?: boolean;
    depth?: 'quick' | 'normal' | 'deep';
  }
  
  export async function scanSubdomains(domain: string, options: ScanOptions = {}) {
    // Implementasi khusus subdomain scanning
    const flaskResponse = await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, ...options })
    });
  
    if (!flaskResponse.ok) {
      throw new Error(await flaskResponse.text());
    }
  
    return await flaskResponse.json();
  }
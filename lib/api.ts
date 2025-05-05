// lib/api.ts
// lib/api.ts
export const runTool = async (toolName: string, params: any) => {
  try {
    let endpoint = '/api/tools/';
    let options: RequestInit = {
      method: 'POST',
      headers: {}
    };

    switch (toolName) {
      case 'Subdomain Finder':
        endpoint += 'subdomain';
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ domain: params.domain });
        break;
        
      case 'WAF Detector':
        endpoint += 'waf';
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ url: params.url });
        break;
        
      default:
        throw new Error('Tool not supported');
    }

    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to execute tool');
    }

    return await response.json();
    
  } catch (error) {
    console.error('Error running tool:', error);
    throw error;
  }
};
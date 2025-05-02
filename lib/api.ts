// lib/api.ts
export const runTool = async (toolName: string, params: Record<string, string>) => {
    try {
      let endpoint = '';
      let payload = {};
  
      switch (toolName) {
        case 'Subdomain Finder':
          endpoint = '/api/subdomain';
          payload = { domain: params.domain };
          break;
        case 'WAF Detector':
          endpoint = '/api/waf';
          payload = { domain: params.domain };
          break;
        default:
          throw new Error('Tool not supported');
      }
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error running tool:', error);
      throw error;
    }
  };
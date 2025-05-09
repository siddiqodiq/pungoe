// app/api/tools/utils/validators.ts
export function validateDomain(domain: string) {
    if (!domain) {
      return { valid: false, message: 'Domain is required' };
    }
    
    // Regex sederhana untuk validasi domain
    const domainRegex = /^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/;
    if (!domainRegex.test(domain)) {
      return { valid: false, message: 'Invalid domain format' };
    }
    
    return { valid: true };
  }
  
  export function validateTarget(target: string) {
    // Validasi URL atau IP address
    try {
      new URL(target);
      return { valid: true };
    } catch {
      // Jika bukan URL, coba validasi sebagai IP
      const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (ipRegex.test(target)) {
        return { valid: true };
      }
      return { valid: false, message: 'Target must be a valid URL or IP address' };
    }
  }

// app/api/tools/utils/validators.ts
export function validateTargetUrl(input: string) {
  if (!input || typeof input !== 'string') {
    return { valid: false, message: 'Input is required' };
  }
  
  // Bersihkan input
  const cleanedInput = input.trim().replace(/^https?:\/\//i, '');

  // Validasi dasar
  if (cleanedInput.length < 3) {
    return { valid: false, message: 'Input too short' };
  }

  // Cek mengandung karakter valid
  if (!/^[a-z0-9\-\.]+\.[a-z]{2,}$/i.test(cleanedInput)) {
    return { valid: false, message: 'Invalid domain format' };
  }

  return { valid: true };
}
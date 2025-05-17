// lib/file-extensions.ts
export const languageToExtension: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  jsx: 'jsx',
  tsx: 'tsx',
  python: 'py',
  bash: 'sh',
  shell: 'sh',
  html: 'html',
  css: 'css',
  json: 'json',
  java: 'java',
  c: 'c',
  csharp: 'cs',
  ruby: 'rb',
  go: 'go',
  rust: 'rs',
  dart: 'dart',
  sql: 'sql',
  php: 'php',
  markup: 'html',
  // Tambahkan mapping lainnya sesuai kebutuhan
};

export function getFileExtension(language: string): string {
  return languageToExtension[language.toLowerCase()] || 'txt';
}
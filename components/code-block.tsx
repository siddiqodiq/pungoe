// components/code-block.tsx
"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import Prism from "@/lib/prism";

// Memoized CodeBlock component to prevent unnecessary re-renders
export const CodeBlock = memo(({ code, language = "text" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // Only highlight if content changed significantly
      const currentCode = codeRef.current.textContent;
      if (currentCode !== code) {
        codeRef.current.textContent = code;
        Prism.highlightElement(codeRef.current);
      }
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-md bg-[#1e1e1e] border border-gray-700 overflow-hidden transition-all duration-100">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-gray-700 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400 hover:text-gray-200" />
          )}
        </button>
      </div>
      <pre className="!m-0 !rounded-none !bg-[#1e1e1e] overflow-x-auto">
        <code 
          ref={codeRef} 
          className={`language-${language} !font-mono !text-sm`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
});
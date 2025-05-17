"use client";

import { memo, useEffect, useRef, useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import Prism from "@/lib/prism";
import "prismjs/themes/prism-tomorrow.css";

export const CodeBlock = memo(({ code, language = "text" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Memoize the highlighted code to prevent unnecessary re-highlighting
  const highlightedCode = useMemo(() => {
    if (typeof window !== 'undefined' && Prism.languages[language]) {
      try {
        return Prism.highlight(code, Prism.languages[language], language);
      } catch (e) {
        console.warn(`Failed to highlight for language ${language}`, e);
        return code;
      }
    }
    return code;
  }, [code, language]);

  useEffect(() => {
    // Clean up Prism classes to prevent duplication
    if (codeRef.current) {
      codeRef.current.innerHTML = highlightedCode;
    }
  }, [highlightedCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-md bg-[#1e1e1e] border border-gray-700 overflow-hidden">
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
      <pre ref={preRef} className="!m-0 !rounded-none !bg-[#1e1e1e] overflow-x-auto">
        <code
          ref={codeRef}
          className={`language-${language} !font-mono !text-sm`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
// components/logo-preview.tsx
"use client"

import { Logo } from "@/components/ui/logo"
import { useState } from "react"

export default function LogoPreview() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const sizes = ["sm", "md", "lg", "xl", "full"] as const

  return (
    <div className={`min-h-screen p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${theme === "dark" ? "text-white" : "text-black"}`}>
          Logo Preview
        </h1>

        {/* Theme Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTheme("dark")}
            className={`px-4 py-2 rounded ${theme === "dark" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Dark Theme
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`px-4 py-2 rounded ${theme === "light" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Light Theme
          </button>
        </div>

        {/* Basic Preview */}
        <div className="mb-12">
          <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Basic Usage
          </h2>
          <div className="flex justify-center p-8 border rounded-lg bg-white/10 h-40">
            <Logo className={`h-full w-auto ${theme === "dark" ? "text-white" : "text-black"}`} />
          </div>
        </div>

        {/* Size Variations */}
        <div className="mb-12">
          <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Size Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sizes.map((size) => (
              <div 
                key={size} 
                className={`p-4 border rounded-lg flex flex-col items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} h-40`}
              >
                <div className="mb-2 text-sm font-medium">
                  {size.toUpperCase()}
                </div>
                <div className="flex-1 flex items-center justify-center overflow-visible w-full">
                  <Logo 
                    className={
                      size === "full" ? 
                      "h-full w-auto" : 
                      size === "sm" ? "h-8 w-auto" :
                      size === "md" ? "h-12 w-auto" :
                      size === "lg" ? "h-16 w-auto" :
                      "h-20 w-auto"
                    } 
                    theme={theme}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Variations */}
        <div className="mb-12">
          <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Color Variations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["blue-500", "red-500", "green-500", "purple-500", "yellow-500", "pink-500", "indigo-500", "gray-500"].map((color) => (
              <div 
                key={color} 
                className={`p-4 border rounded-lg flex flex-col items-center ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} h-32`}
              >
                <div className={`mb-2 text-sm font-medium text-${color}`}>
                  {color.split('-')[0].toUpperCase()}
                </div>
                <Logo className={`h-12 w-auto text-${color}`} />
              </div>
            ))}
          </div>
        </div>

        {/* With Background */}
        <div className="mb-12">
          <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            With Background
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { bg: "bg-gradient-to-br from-blue-500 to-purple-600", text: "text-white" },
              { bg: "bg-black", text: "text-white" },
              { bg: "bg-white", text: "text-black" },
              { bg: "bg-gray-900", text: "text-blue-400" },
              { bg: "bg-yellow-400", text: "text-red-600" },
              { bg: "bg-gradient-to-br from-green-400 to-blue-500", text: "text-white" },
            ].map((variant, index) => (
              <div 
                key={index} 
                className={`${variant.bg} rounded-lg p-8 flex items-center justify-center h-40`}
              >
                <Logo className={`h-full w-auto ${variant.text}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

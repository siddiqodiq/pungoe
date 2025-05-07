"use client"

import { useState, useEffect } from "react"
import { tools } from "@/lib/tools"
import { useToast } from "@/components/ui/use-toast"
import { BaseToolModal } from "@/components/tools/base-tool-modal"
import { SubdomainModal } from "@/components/tools/subdomain-modal"
import { WafModal } from "@/components/tools/waf-modal"

interface ToolModalProps {
  toolId: string | null
  isOpen: boolean
  onClose: () => void
  onSendToChat?: (content: string) => void
}

export function ToolModal({ toolId, isOpen, onClose, onSendToChat }: ToolModalProps) {
  const selectedTool = tools.find((tool) => tool.id === toolId)

  if (!isOpen || !selectedTool) {
    return null
  }

  // Render modal spesifik berdasarkan tool
  switch (selectedTool.name) {
    case "Subdomain Finder":
      return (
        <SubdomainModal 
          tool={selectedTool}
          isOpen={isOpen}
          onClose={onClose}
          onSendToChat={onSendToChat}
        />
      )
    case "WAF Detector":
      return (
        <WafModal 
          tool={selectedTool}
          isOpen={isOpen}
          onClose={onClose}
          onSendToChat={onSendToChat}
        />
      )
    default:
      return (
        <BaseToolModal tool={selectedTool} isOpen={isOpen} onClose={onClose}>
          <div className="p-4">
            <p>This tool is not yet implemented</p>
          </div>
        </BaseToolModal>
      )
  }
}
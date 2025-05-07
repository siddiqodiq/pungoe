"use client"

import { useState, useEffect } from "react"
import { tools } from "@/lib/tools"
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
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const selectedTool = tools.find((tool) => tool.id === toolId)

  // Sync internal state with props
  useEffect(() => {
    if (isOpen) {
      setInternalIsOpen(true)
    } else {
      // Add delay to allow animations to complete
      const timer = setTimeout(() => {
        setInternalIsOpen(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setInternalIsOpen(false)
    onClose()
  }

  if (!internalIsOpen || !selectedTool) {
    return null
  }

  switch (selectedTool.name) {
    case "Subdomain Finder":
      return (
        <SubdomainModal 
          tool={selectedTool}
          isOpen={internalIsOpen}
          onClose={handleClose}
          onSendToChat={onSendToChat}
        />
      )
    case "WAF Detector":
      return (
        <WafModal 
          tool={selectedTool}
          isOpen={internalIsOpen}
          onClose={handleClose}
          onSendToChat={onSendToChat}
        />
      )
    default:
      return (
        <BaseToolModal tool={selectedTool} isOpen={internalIsOpen} onClose={handleClose}>
          <div className="p-4">
            <p>This tool is not yet implemented</p>
          </div>
        </BaseToolModal>
      )
  }
}
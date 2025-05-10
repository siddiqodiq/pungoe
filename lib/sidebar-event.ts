"use client"

import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export function useSidebarEvents() {
  const leftSidebar = useSidebar()
  const rightSidebar = useSidebar()

  useEffect(() => {
    const handleLeftToggle = () => leftSidebar?.toggleSidebar()
    const handleRightToggle = () => rightSidebar?.toggleSidebar()

    document.addEventListener('toggle-left-sidebar', handleLeftToggle)
    document.addEventListener('toggle-right-sidebar', handleRightToggle)

    return () => {
      document.removeEventListener('toggle-left-sidebar', handleLeftToggle)
      document.removeEventListener('toggle-right-sidebar', handleRightToggle)
    }
  }, [leftSidebar, rightSidebar])
}
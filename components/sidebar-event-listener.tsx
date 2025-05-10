"use client"

import { useEffect } from "react"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarEventsListener() {
  const leftSidebar = useSidebar()
  const rightSidebar = useSidebar()

  useEffect(() => {
    const handleLeftToggle = () => {
      if (leftSidebar) {
        if (leftSidebar.isMobile) {
          leftSidebar.setOpenMobile(!leftSidebar.openMobile)
        } else {
          leftSidebar.setOpen(!leftSidebar.open)
        }
      }
    }

    const handleRightToggle = () => {
      if (rightSidebar) {
        if (rightSidebar.isMobile) {
          rightSidebar.setOpenMobile(!rightSidebar.openMobile)
        } else {
          rightSidebar.setOpen(!rightSidebar.open)
        }
      }
    }

    document.addEventListener('toggle-left-sidebar', handleLeftToggle)
    document.addEventListener('toggle-right-sidebar', handleRightToggle)

    return () => {
      document.removeEventListener('toggle-left-sidebar', handleLeftToggle)
      document.removeEventListener('toggle-right-sidebar', handleRightToggle)
    }
  }, [leftSidebar, rightSidebar])

  return null
}
"use client"

import { useState } from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { ToolsSidebar } from "@/components/tools-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Menu, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#212121]">
      <MainSidebar />
      <SidebarInset className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {/* Mobile menu buttons - only visible on small screens */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>

          <div className="md:hidden fixed top-4 right-4 z-50">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700"
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
            >
              <Wrench className="h-5 w-5" />
              <span className="sr-only">Toggle Tools</span>
            </Button>
          </div>

          <ChatInterface activeTool={activeTool} />
        </div>
      </SidebarInset>
      <ToolsSidebar onSelectTool={setActiveTool} activeTool={activeTool} />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Shield, Database, Settings, LogOut, User, Bell, Moon, HelpCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Logo } from "./ui/logo"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"


// Sample chat history data
const chatHistory = [
  { id: "1", title: "Network scan results" },
  { id: "2", title: "SQL injection analysis" },
  { id: "3", title: "XSS vulnerability report" },
  { id: "4", title: "Port scanning session" },
  { id: "5", title: "Password cracking attempt" },
]

export function MainSidebar() {
  const [activeItem, setActiveItem] = useState("dashboard")
  const { data: session } = useSession()
  const router = useRouter()

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name?: string | null) => {
    if (!name) return 'US'
    const names = name.split(' ')
    let initials = names[0].substring(0, 1).toUpperCase()
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase()
    }
    return initials
  }

  // Fungsi untuk handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  useEffect(() => {
    const handleToggle = () => {
      document.dispatchEvent(new CustomEvent('toggle-left-sidebar'))
    }
    
    // Add event listener for keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Shield,
      onClick: () => router.push("/dashboard")
    },
    { 
      id: "database", 
      label: "Database", 
      icon: Database,
      onClick: () => router.push("/database")
    },
  ]

  const settingsItems = [
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ]

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="p-3">
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md gradient-bg hover-pulse">
          <Logo className="h-9 w-9 text-white" />
        </div>
        <div className="font-bold text-lg gradient-text">Pungoe Pentest</div>
      </div>
    </SidebarHeader>
      <SidebarContent>
       <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeItem === item.id}
                  onClick={() => {
                    setActiveItem(item.id)
                    item.onClick()
                  }}
                  className={`hover-effect ${activeItem === item.id ? "glow-border" : ""}`}
                >
                  <item.icon className={`h-5 w-5 ${activeItem === item.id ? "text-gray-400" : ""}`} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton className="hover-effect">
                    <span className="truncate">{chat.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-gray-500/30 cursor-pointer hover:border-gray-400 transition-colors">
                  {session?.user?.avatar ? (
                    <AvatarImage src={session.user.avatar} alt="User" />
                  ) : (
                    <AvatarFallback className="bg-gray-800 text-gray-300">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              <p className="text-sm font-medium">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400">
                @{session?.user?.username || 'username'}
              </p>
            </div>
          </div>

          <Separator className="my-2 bg-gray-800" />

          <div className="mt-2">
            <p className="text-sm font-medium mb-2">Settings</p>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="hover-effect py-1.5">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
      <SidebarTrigger className="absolute left-4 top-4 z-50 md:hidden hover-effect" />
    </Sidebar>
  )
}

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../../app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { RouteGuard } from "@/components/route-guard"
import { SidebarEventsListener } from "@/components/sidebar-event-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pungoe Pentest - Penetration Testing Assistant",
  description: "Penetration testing assistant with AI",
  icons: {
    icon: "logo.ico",
    shortcut: "logo.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Remove the html tag here - it should only be in the root layout
    <div className={`${inter.className} bg-black`}>
      <RouteGuard>
        <SidebarProvider>
          {/* Tambahkan listener untuk event sidebar */}
          <SidebarEventsListener />
          {children}
        </SidebarProvider>
      </RouteGuard>
    </div>
  )
}
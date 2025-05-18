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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false} 
          forcedTheme="dark"
        >
          <RouteGuard>
            <SidebarProvider>
              {/* Tambahkan listener untuk event sidebar */}
              <SidebarEventsListener />
              {children}
            </SidebarProvider>
          </RouteGuard>
        </ThemeProvider>
      </body>
    </html>
  )
}
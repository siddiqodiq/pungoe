import type { Metadata } from "next"
import '../../app/globals.css'

export const metadata: Metadata = {
  title: "Register - Pungoe Pentest",
  description: "Register to Pungoe Pentest",
  icons: {
    icon: "logo.ico",
    shortcut: "logo.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="register-container">
      {children}
    </div>
  )
}
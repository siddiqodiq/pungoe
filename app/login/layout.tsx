import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Pungoe Pentest",
  description: "Login to Pungoe Pentest",
  icons: {
    icon: "logo.ico",
    shortcut: "logo.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
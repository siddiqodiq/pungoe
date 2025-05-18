import "./landing.css"
import { Inter } from "next/font/google"
import { Providers } from "../app/providers"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black`}>
        <Providers>
          <div className="landing-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
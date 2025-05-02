import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Electricity Meter Analyzer",
  description: "Upload a photo of your electricity meter to check if it's an RTS meter",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Place ThemeProvider OUTSIDE html/body for next-themes best practice
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ThemeProvider>
  )
}

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Check Your Meter",
  description: "Upload a photo of your electricity meter to check if it's an RTS meter that needs replacement",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/Logo.PNG', sizes: 'any' },
      { url: '/Logo.PNG' }
    ],
    apple: '/Logo.PNG',
    shortcut: '/Logo.PNG'
  },
  openGraph: {
    title: 'Check Your Meter',
    description: 'Upload a photo of your electricity meter to check if it\'s an RTS meter that needs replacement',
    images: [
      {
        url: '/Logo.PNG',
        width: 512,
        height: 512,
        alt: 'Check Your Meter Logo'
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Check Your Meter',
    description: 'Upload a photo of your electricity meter to check if it\'s an RTS meter that needs replacement',
    images: ['/Logo.PNG'],
    creator: '@checkyourmeter'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ThemeProvider should wrap the children INSIDE the body tag
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7602339756703410"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <link rel="icon" href="/Logo.PNG" sizes="any" />
        <link rel="apple-touch-icon" href="/Logo.PNG" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

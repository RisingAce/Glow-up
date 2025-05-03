import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import the Inter function
import Script from 'next/script'; // Import Script
import "./globals.css";
import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";

// Configure the Inter font
const inter = Inter({ subsets: ["latin"] });

// Vercel Analytics
const VERCEL_ANALYTICS_ID = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '';

export const metadata: Metadata = {
  title: "Check Your Meter - RTS Meter Photo Checker",
  description: "Upload a photo of your electricity meter and instantly check if it's an RTS meter that needs replacement. Free, quick and reliable meter verification tool.",
  generator: 'v0.dev',
  metadataBase: new URL('https://checkyourmeter.com'),
  keywords: ['electricity meter', 'RTS meter', 'meter replacement', 'meter check', 'meter photo', 'utility meters'],
  authors: [{ name: 'Check Your Meter' }],
  creator: 'Check Your Meter',
  publisher: 'Check Your Meter',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/Logo.PNG', sizes: 'any' },
      { url: '/Logo.PNG' }
    ],
    apple: '/Logo.PNG',
    shortcut: '/Logo.PNG'
  },
  openGraph: {
    title: 'Check Your Meter - RTS Meter Photo Checker',
    description: 'Upload a photo of your electricity meter and instantly check if it\'s an RTS meter that needs replacement. Free, quick and reliable meter verification tool.',
    url: 'https://checkyourmeter.com',
    siteName: 'Check Your Meter',
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
    title: 'Check Your Meter - RTS Meter Photo Checker',
    description: 'Upload a photo of your electricity meter and instantly check if it\'s an RTS meter that needs replacement. Free, quick and reliable meter verification tool.',
    images: ['/Logo.PNG'],
    creator: '@checkyourmeter'
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual code when available
  },
  alternates: {
    canonical: 'https://checkyourmeter.com',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline Vercel Analytics script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
              window.va('init', '${VERCEL_ANALYTICS_ID}');
              window.va('event', 'pageview');
            `,
          }}
        />
        <script async src="/_vercel/insights/script.js"></script>

        {/* Google AdSense Script - Using direct script tag instead of Next.js Script component */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7602339756703410"
          crossOrigin="anonymous"
        />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Check Your Meter",
              "url": "https://checkyourmeter.com",
              "description": "Upload a photo of your electricity meter and instantly check if it's an RTS meter that needs replacement. Free, quick and reliable meter verification tool.",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "GBP"
              },
              "screenshot": "https://checkyourmeter.com/Logo.PNG",
              "featureList": "Meter photo verification, RTS meter detection, Instant results",
              "author": {
                "@type": "Organization",
                "name": "Check Your Meter",
                "url": "https://checkyourmeter.com"
              }
            })
          }}
        />
        <link rel="icon" href="/Logo.PNG" sizes="any" />
        <link rel="apple-touch-icon" href="/Logo.PNG" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="twitter:image" content="https://www.checkyourmeter.co.uk/og-image.png" />
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

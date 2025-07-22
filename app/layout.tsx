import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geo Law Empire',
  description: 'Create by Carlos Freire',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/images/icconoweb.png" type="image/png" />
      </head>
      <body className="h-full">
        {children}
        <Analytics />
      </body>
    </html>
  )
}

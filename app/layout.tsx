import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Geo Law Empire 1',
  description: 'Create by Carlos Freire',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}

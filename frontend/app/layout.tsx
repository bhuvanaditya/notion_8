import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notion Clone - Your Second Brain',
  description: 'A powerful workspace for your notes, tasks, and ideas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
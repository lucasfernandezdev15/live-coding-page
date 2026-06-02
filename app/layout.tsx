import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DevProbe — Live Coding Tests',
  description: 'Interactive coding challenges: TypeScript, React, Next.js, React Query, Zustand, Auth & Testing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EcoHunt - Earn GREEN Tokens',
  description: 'Join the environmental revolution! Complete eco-friendly challenges and earn GREEN tokens on Base network.',
  keywords: ['environment', 'conservation', 'blockchain', 'tokens', 'sustainability'],
  authors: [{ name: 'EcoHunt Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
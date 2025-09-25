import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { OnchainProviders } from '../src/providers/OnchainProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1
}

export const metadata: Metadata = {
  title: 'EcoHunt - Earn GREEN Tokens',
  description: 'Join the environmental revolution! Complete eco-friendly challenges and earn GREEN tokens on Base network.',
  keywords: ['environment', 'conservation', 'blockchain', 'tokens', 'sustainability'],
  authors: [{ name: 'EcoHunt Team' }],
  openGraph: {
    title: 'EcoHunt - Earn GREEN Tokens',
    description: 'Turn your eco-friendly actions into GREEN tokens with AI verification',
    images: ['https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app/og-image.png'],
    url: 'https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoHunt - Earn GREEN Tokens',
    description: 'Turn your eco-friendly actions into GREEN tokens with AI verification',
    images: ['https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app/og-image.png'],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app/preview.png",
      button: {
        title: "🌱 Start EcoHunt",
        action: {
          type: "launch_frame",
          url: "https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app",
          name: "EcoHunt",
          splashImageUrl: "https://frontend-2kl6c2f7j-serkans-projects-9991a7f3.vercel.app/splash.png",
          splashBackgroundColor: "#10b981"
        }
      }
    })
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OnchainProviders>
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
        </OnchainProviders>
      </body>
    </html>
  )
}
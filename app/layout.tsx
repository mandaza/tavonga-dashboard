import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth'
import SWRProvider from '@/components/SWRProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tavonga CareConnect Admin Dashboard',
  description: 'Admin dashboard for Tavonga Autism & Intellectual Disability Support System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRProvider>
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#F9F5F4',
                  color: '#000000',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                },
              }}
            />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  )
} 
'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'
import { config } from '@/lib/config'

interface SWRProviderProps {
  children: ReactNode
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          // Convert relative URLs to absolute URLs using the configured API base
          const absoluteUrl = url.startsWith('/api/v1') 
            ? `${config.apiUrl.replace('/api/v1', '')}${url}`
            : url

          const response = await fetch(absoluteUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          return response.json()
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
} 
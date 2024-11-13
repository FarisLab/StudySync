'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import StyledComponentsRegistry from './lib/registry'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <StyledComponentsRegistry>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </StyledComponentsRegistry>
      </AuthProvider>
    </SessionProvider>
  )
} 
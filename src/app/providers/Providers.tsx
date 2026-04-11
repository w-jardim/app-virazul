import React, { useEffect } from 'react'
import { useBootstrapSession } from '@/features/auth/hooks/useBootstrapSession'
import { clearUnauthorizedHandler, setUnauthorizedHandler } from '@/lib/api/axios'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clearSession = useAuthStore((state) => state.clearSession)

  useBootstrapSession()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })

    return () => {
      clearUnauthorizedHandler()
    }
  }, [clearSession])

  return <>{children}</>
}

export default Providers

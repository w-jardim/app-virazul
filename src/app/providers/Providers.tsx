import React, { useCallback, useEffect, useState } from 'react'
import { useBootstrapSession } from '@/features/auth/hooks/useBootstrapSession'
import { clearUnauthorizedHandler, setUnauthorizedHandler, setPlanExpiredHandler, clearPlanExpiredHandler } from '@/lib/api/axios'
import { useAuthStore } from '@/features/auth/store/useAuthStore'

const PlanExpiredToast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-5 py-3 shadow-lg text-sm text-red-700 flex items-center gap-3">
    <span>{message}</span>
    <button type="button" onClick={onClose} className="font-bold text-red-400 hover:text-red-600">&times;</button>
  </div>
)

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clearSession = useAuthStore((state) => state.clearSession)
  const [planMsg, setPlanMsg] = useState<string | null>(null)

  useBootstrapSession()

  const handlePlanExpired = useCallback((msg: string) => {
    setPlanMsg(msg)
    setTimeout(() => setPlanMsg(null), 6000)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })
    setPlanExpiredHandler(handlePlanExpired)

    return () => {
      clearUnauthorizedHandler()
      clearPlanExpiredHandler()
    }
  }, [clearSession, handlePlanExpired])

  return (
    <>
      {children}
      {planMsg && <PlanExpiredToast message={planMsg} onClose={() => setPlanMsg(null)} />}
    </>
  )
}

export default Providers

import { useEffect, useMemo, useRef } from 'react'
import { initializeGoogleIdentity, renderGoogleButton } from '../googleIdentity'

type GoogleLoginButtonProps = {
  disabled?: boolean
  onCredential: (idToken: string) => void
  onError: () => void
}

const GoogleLoginButton = ({ disabled = false, onCredential, onError }: GoogleLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const clientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '', [])

  useEffect(() => {
    if (!clientId || !containerRef.current) {
      return
    }

    let cancelled = false

    const handleCredentialResponse = (response: any) => {
      if (!response || !response.credential) {
        onError()
        return
      }
      onCredential(response.credential)
    }

    initializeGoogleIdentity(handleCredentialResponse)
      .then(() => {
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = ''
        renderGoogleButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large'
        })
      })
      .catch(() => {
        if (!cancelled) onError()
      })

    return () => {
      cancelled = true
    }
  }, [clientId, onCredential, onError])

  if (!clientId) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="w-full max-w-[320px] rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700"
      >
        <div className="mb-2 font-semibold">Google Login não configurado</div>
        <div>Variável VITE_GOOGLE_CLIENT_ID ausente. Defina-a em .env para habilitar o login com Google.</div>
      </div>
    )
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
      <div ref={containerRef} />
    </div>
  )
}

export default GoogleLoginButton

import { useEffect, useMemo, useRef } from 'react'
import { initializeGoogleIdentity, renderGoogleButton } from '../googleIdentity'

type GoogleLoginButtonProps = {
  disabled?: boolean
  onCredential: (idToken: string) => void
  onError: () => void
}

const SCRIPT_ID = 'google-identity-services-script'

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
      <button
        type="button"
        onClick={onError}
        className="w-full max-w-[320px] rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Entrar com Google
      </button>
    )
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
      <div ref={containerRef} />
    </div>
  )
}

export default GoogleLoginButton

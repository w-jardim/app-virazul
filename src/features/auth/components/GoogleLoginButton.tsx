import { useEffect, useMemo, useRef } from 'react'

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

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            onError()
            return
          }
          onCredential(response.credential)
        }
      })

      containerRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320
      })
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (window.google?.accounts?.id) {
      renderButton()
      return () => {
        cancelled = true
      }
    }

    if (existingScript) {
      existingScript.addEventListener('load', renderButton)
      existingScript.addEventListener('error', onError)
      return () => {
        cancelled = true
        existingScript.removeEventListener('load', renderButton)
        existingScript.removeEventListener('error', onError)
      }
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderButton)
    script.addEventListener('error', onError)
    document.head.appendChild(script)

    return () => {
      cancelled = true
      script.removeEventListener('load', renderButton)
      script.removeEventListener('error', onError)
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

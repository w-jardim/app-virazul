const SCRIPT_ID = 'google-identity-services-script'
let alreadyInitialized = false
let initPromise: Promise<InitResult> | null = null
let credentialHandler: ((res: any) => void) | null = null

type InitResult = {
  initialized: boolean
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      if ((window as any).google?.accounts?.id) return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('google identity script failed to load')))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('google identity script failed to load')))
    document.head.appendChild(script)
  })
}

export async function initializeGoogleIdentity(handleCredentialResponse: (res: any)=>void): Promise<InitResult> {
  if (typeof window === 'undefined') return { initialized: false }
  credentialHandler = handleCredentialResponse

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  if (!clientId) {
    console.error('VITE_GOOGLE_CLIENT_ID is not defined')
    return { initialized: false }
  }

  if ((window as any).google?.accounts?.id && alreadyInitialized) {
    return { initialized: true }
  }

  if (initPromise) return initPromise

  initPromise = (async () => {
    await loadScript()

    if (!(window as any).google?.accounts?.id) {
      throw new Error('google.accounts.id not available after script load')
    }

    if (!alreadyInitialized) {
      ;(window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (credentialHandler) credentialHandler(response)
        }
      })
      alreadyInitialized = true
    }

    return { initialized: true }
  })()

  try {
    return await initPromise
  } finally {
    initPromise = null
  }
}

export function renderGoogleButton(container: HTMLElement, options: Record<string, any>) {
  if (typeof window === 'undefined') return
  if (!container) return
  if ((window as any).google?.accounts?.id) {
    (window as any).google.accounts.id.renderButton(container, options)
  }
}

export function isGoogleInitialized() {
  return alreadyInitialized || !!(window as any).google?.accounts?.id
}

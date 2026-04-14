import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver para jsdom (necessário para Recharts)
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver
}

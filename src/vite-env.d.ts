/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  electronAPI?: {
    platform: string
    getAppVersion: () => Promise<string>
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void
    openExternalUrl: (url: string) => void
  }
}

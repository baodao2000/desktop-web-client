/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type UpdateEvent =
  | { type: 'progress'; percent: number }
  | { type: 'downloaded' }
  | { type: 'error'; message: string }

interface Window {
  electronAPI?: {
    platform: string
    getAppVersion: () => Promise<string>
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void
    openExternalUrl: (url: string) => void
    downloadUpdate: (url: string) => Promise<void>
    installUpdate: () => void
    onUpdateEvent: (callback: (event: UpdateEvent) => void) => () => void
  }
}

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

type UpdateEvent =
  | { type: 'progress'; percent: number }
  | { type: 'downloaded' }
  | { type: 'error'; message: string }

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  openExternalUrl: (url: string) => ipcRenderer.send('open-external-url', url),
  downloadUpdate: (url: string) => ipcRenderer.invoke('update-download', url),
  installUpdate: () => ipcRenderer.send('update-install'),
  onUpdateEvent: (callback: (event: UpdateEvent) => void) => {
    const listener = (_: IpcRendererEvent, event: UpdateEvent) => callback(event)
    ipcRenderer.on('update-event', listener)
    return () => {
      ipcRenderer.removeListener('update-event', listener)
    }
  },
})

// Optional TypeScript declaration
export type ElectronAPI = {
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

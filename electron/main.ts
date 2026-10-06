import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'

let mainWindow: BrowserWindow | null = null

// Trạng thái tải bản cập nhật (dùng cho macOS, nơi không dùng được autoUpdater)
let pendingUpdateDownload = false
let downloadedInstallerPath: string | null = null

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Desktop Web Client',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    // Modern sleek window appearance
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready-to-show to avoid white flash
  })

  // Prevent white flicker during load
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load appropriate URL
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // macOS: bắt file DMG do luồng cập nhật tải về, báo tiến độ cho giao diện
  mainWindow.webContents.session.on('will-download', (_, item) => {
    if (!pendingUpdateDownload) return
    pendingUpdateDownload = false

    item.setSavePath(path.join(app.getPath('downloads'), item.getFilename()))

    item.on('updated', () => {
      const total = item.getTotalBytes()
      if (total > 0) {
        sendUpdateEvent({ type: 'progress', percent: (item.getReceivedBytes() / total) * 100 })
      }
    })

    item.once('done', (_, state) => {
      if (state === 'completed') {
        downloadedInstallerPath = item.getSavePath()
        sendUpdateEvent({ type: 'downloaded' })
      } else {
        sendUpdateEvent({ type: 'error', message: `Tải bản cập nhật thất bại (${state})` })
      }
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Auto Update
type UpdateEvent =
  | { type: 'progress'; percent: number }
  | { type: 'downloaded' }
  | { type: 'error'; message: string }

function sendUpdateEvent(event: UpdateEvent) {
  mainWindow?.webContents.send('update-event', event)
}

// Chỉ tải khi người dùng bấm, nhưng nếu đã tải xong mà chưa cài thì tự cài khi thoát app
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

autoUpdater.on('download-progress', (progress) => {
  sendUpdateEvent({ type: 'progress', percent: progress.percent })
})

autoUpdater.on('update-downloaded', () => {
  sendUpdateEvent({ type: 'downloaded' })
})

autoUpdater.on('error', (err) => {
  sendUpdateEvent({ type: 'error', message: err.message })
})

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.on('open-external-url', (_, url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    shell.openExternal(url)
  }
})

ipcMain.handle('update-download', async (_, url: string) => {
  // Windows: electron-updater tải bộ cài NSIS từ GitHub Release (dựa trên latest.yml)
  if (process.platform === 'win32') {
    const result = await autoUpdater.checkForUpdates()
    if (!result) {
      throw new Error('Không kiểm tra được bản cập nhật (app chưa được đóng gói?)')
    }
    await autoUpdater.downloadUpdate()
    return
  }

  // macOS: app chưa ký Developer ID nên Squirrel.Mac không cài được — tải DMG về rồi mở cho người dùng
  if (!url.startsWith('https://github.com/')) {
    throw new Error('Link tải không hợp lệ')
  }
  pendingUpdateDownload = true
  mainWindow?.webContents.downloadURL(url)
})

ipcMain.on('update-install', async () => {
  if (process.platform === 'win32') {
    // Cài im lặng rồi tự mở lại app
    autoUpdater.quitAndInstall(true, true)
    return
  }

  if (downloadedInstallerPath) {
    // Mở DMG và thoát app để người dùng kéo bản mới đè vào Applications
    await shell.openPath(downloadedInstallerPath)
    app.quit()
  }
})

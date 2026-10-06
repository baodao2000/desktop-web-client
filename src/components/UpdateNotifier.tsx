import React, { useEffect, useState } from 'react'
import { checkGitHubUpdate, ReleaseInfo } from '../utils/version'
import { Sparkles, Download, X, RefreshCw } from 'lucide-react'

// Phiên bản ứng dụng hiện tại fallback
const APP_VERSION = '1.0.2'

export const UpdateNotifier: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<ReleaseInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'downloaded' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Chỉ bản desktop Windows/macOS mới tải và cài được ngay trong app
  const platform = window.electronAPI?.platform
  const canUpdateInApp =
    !!window.electronAPI?.downloadUpdate && (platform === 'win32' || platform === 'darwin')
  const isMac = platform === 'darwin'

  useEffect(() => {
    if (!window.electronAPI?.onUpdateEvent) return
    return window.electronAPI.onUpdateEvent((event) => {
      if (event.type === 'progress') {
        setProgress(event.percent)
      } else if (event.type === 'downloaded') {
        setStatus('downloaded')
      } else {
        setErrorMessage(event.message)
        setStatus('error')
      }
    })
  }, [])

  useEffect(() => {
    // Lấy phiên bản thực tế từ Electron nếu có
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then((v) => {
        if (v) setCurrentVersion(v)
        checkUpdate(v || APP_VERSION)
      })
    } else {
      checkUpdate(APP_VERSION)
    }
  }, [])

  const checkUpdate = async (version: string) => {
    const info = await checkGitHubUpdate(version)
    if (info && info.hasUpdate) {
      // Kiểm tra xem người dùng đã bấm tắt thông báo phiên bản này trong phiên làm việc chưa
      const ignored = sessionStorage.getItem(`ignore_update_${info.latestVersion}`)
      if (!ignored) {
        setUpdateInfo(info)
      }
    }
  }

  const openDownloadPage = () => {
    if (!updateInfo) return
    if (window.electronAPI?.openExternalUrl) {
      window.electronAPI.openExternalUrl(updateInfo.downloadUrl)
    } else {
      window.open(updateInfo.downloadUrl, '_blank')
    }
  }

  const handleDownload = async () => {
    if (!updateInfo) return
    if (!canUpdateInApp) {
      openDownloadPage()
      return
    }

    setStatus('downloading')
    setProgress(0)
    try {
      await window.electronAPI!.downloadUpdate(updateInfo.downloadUrl)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  const handleInstall = () => {
    window.electronAPI?.installUpdate()
  }

  const handleDismiss = () => {
    if (updateInfo) {
      sessionStorage.setItem(`ignore_update_${updateInfo.latestVersion}`, 'true')
    }
    setDismissed(true)
  }

  if (!updateInfo || !updateInfo.hasUpdate || dismissed) {
    return null
  }

  return (
    <div className="update-banner-overlay">
      <div className="update-banner">
        <div className="update-banner-left">
          <div className="update-icon-pulse">
            <Sparkles size={20} className="text-warning" />
          </div>
          <div>
            <div className="flex-row items-center gap-2">
              <strong className="text-sm">Đã có phiên bản mới: v{updateInfo.latestVersion}</strong>
              <span className="badge-update-tag">v{currentVersion} ➔ v{updateInfo.latestVersion}</span>
            </div>
            {status === 'downloading' ? (
              <div className="update-progress">
                <div className="update-progress-track">
                  <div className="update-progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs update-notes">Đang tải... {Math.round(progress)}%</span>
              </div>
            ) : status === 'downloaded' ? (
              <p className="text-xs update-notes">
                {isMac
                  ? 'Đã tải xong. Bấm "Mở bộ cài" rồi kéo app vào thư mục Applications để thay bản cũ.'
                  : 'Đã tải xong. Khởi động lại để hoàn tất cập nhật.'}
              </p>
            ) : status === 'error' ? (
              <p className="text-xs update-notes update-error">Lỗi cập nhật: {errorMessage}</p>
            ) : (
              updateInfo.releaseNotes && (
                <p className="text-xs text-secondary update-notes">
                  {updateInfo.releaseNotes.slice(0, 100)}
                  {updateInfo.releaseNotes.length > 100 ? '...' : ''}
                </p>
              )
            )}
          </div>
        </div>

        <div className="update-banner-right">
          {status === 'idle' && (
            <button className="btn-update-action" onClick={handleDownload}>
              <Download size={15} /> {canUpdateInApp ? 'Cập nhật ngay' : 'Tải bản mới ngay'}
            </button>
          )}
          {status === 'downloaded' && (
            <button className="btn-update-action" onClick={handleInstall}>
              <RefreshCw size={15} /> {isMac ? 'Mở bộ cài' : 'Khởi động lại'}
            </button>
          )}
          {status === 'error' && (
            <button className="btn-update-action" onClick={openDownloadPage}>
              <Download size={15} /> Tải thủ công
            </button>
          )}
          {status !== 'downloading' && (
            <button className="btn-update-close" onClick={handleDismiss} title="Đóng thông báo">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

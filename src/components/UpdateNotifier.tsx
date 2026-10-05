import React, { useEffect, useState } from 'react'
import { checkGitHubUpdate, ReleaseInfo } from '../utils/version'
import { Sparkles, Download, X } from 'lucide-react'

// Phiên bản ứng dụng hiện tại fallback
const APP_VERSION = '1.0.2'

export const UpdateNotifier: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<ReleaseInfo | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION)

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

  const handleDownload = () => {
    if (!updateInfo) return
    if (window.electronAPI?.openExternalUrl) {
      window.electronAPI.openExternalUrl(updateInfo.downloadUrl)
    } else {
      window.open(updateInfo.downloadUrl, '_blank')
    }
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
            {updateInfo.releaseNotes && (
              <p className="text-xs text-secondary update-notes">
                {updateInfo.releaseNotes.slice(0, 100)}
                {updateInfo.releaseNotes.length > 100 ? '...' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="update-banner-right">
          <button className="btn-update-action" onClick={handleDownload}>
            <Download size={15} /> Tải bản mới ngay
          </button>
          <button className="btn-update-close" onClick={handleDismiss} title="Đóng thông báo">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

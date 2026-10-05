import React, { useEffect, useState } from 'react'
import { Monitor, Globe, Minus, Square, X } from 'lucide-react'

export const DesktopControls: React.FC = () => {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  const [version, setVersion] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')

  useEffect(() => {
    if (window.electronAPI) {
      setPlatform(window.electronAPI.platform)
      window.electronAPI.getAppVersion().then(setVersion)
    }
  }, [])

  return (
    <div className="env-banner">
      <div className="env-info">
        {isElectron ? (
          <>
            <span className="env-pill desktop">
              <Monitor size={14} /> Desktop App (Electron)
            </span>
            <span className="text-xs text-muted">
              OS: <strong>{platform}</strong> | v{version || '1.0.0'}
            </span>
          </>
        ) : (
          <>
            <span className="env-pill web">
              <Globe size={14} /> Web Browser Mode
            </span>
            <span className="text-xs text-muted">
              Chạy trên trình duyệt (Chạy <code>npm run electron:dev</code> để mở bản Desktop)
            </span>
          </>
        )}
      </div>

      {isElectron && (
        <div className="window-actions">
          <button
            className="action-btn"
            onClick={() => window.electronAPI?.minimizeWindow()}
            title="Thu nhỏ"
          >
            <Minus size={14} />
          </button>
          <button
            className="action-btn"
            onClick={() => window.electronAPI?.maximizeWindow()}
            title="Phóng to"
          >
            <Square size={12} />
          </button>
          <button
            className="action-btn close"
            onClick={() => window.electronAPI?.closeWindow()}
            title="Đóng"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

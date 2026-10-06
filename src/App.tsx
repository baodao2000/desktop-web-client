import React from 'react'
import { DesktopControls } from './components/DesktopControls'
import { ApiStatusBadge } from './components/ApiStatusBadge'
import { DataDemo } from './components/DataDemo'
import { UpdateNotifier } from './components/UpdateNotifier'
import { Terminal, Package, Layers, ShieldCheck } from 'lucide-react'
import './App.css'

export const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* Thông báo cập nhật phiên bản mới */}
      <UpdateNotifier />

      {/* Thanh điều khiển Desktop / Banner */}
      <DesktopControls />

      {/* Main Header */}
      <header className="main-header">
        <div className="header-left">
          <div className="logo-badge">
            <Layers size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="title">Desktop & Web React Client</h1>
            <p className="subtitle">
              Hello <strong>Phú Anh Yêu Phát Yêu Thơ Yêu Đức Yêu Tú</strong>
            </p>
          </div>
        </div>

        {/* Trạng thái kết nối Server */}
        <ApiStatusBadge />
      </header>

      {/* Content Layout */}
      <main className="main-content">
        {/* Hướng dẫn các lệnh chạy & build */}
        <div className="command-grid">
          <div className="command-card">
            <div className="command-title">
              <Terminal size={16} className="text-primary" />
              <span>Chạy giao diện Web</span>
            </div>
            <p className="command-desc">Chạy trên trình duyệt (Chrome, Safari, Edge) với HMR cực nhanh.</p>
            <code className="command-snippet">npm run dev</code>
          </div>

          <div className="command-card highlight">
            <div className="command-title">
              <Terminal size={16} className="text-success" />
              <span>Chạy ứng dụng Desktop</span>
            </div>
            <p className="command-desc">Chạy cửa sổ Electron Desktop để phát triển và kiểm thử.</p>
            <code className="command-snippet">npm run electron:dev</code>
          </div>

          <div className="command-card">
            <div className="command-title">
              <Package size={16} className="text-warning" />
              <span>Đóng gói File Cài Đặt</span>
            </div>
            <p className="command-desc">Build ra file cài đặt (.exe cho Windows, .dmg cho macOS, .deb cho Linux).</p>
            <code className="command-snippet">npm run electron:build</code>
          </div>
        </div>

        {/* Khu vực tương tác API Express */}
        <DataDemo />

        {/* Thông tin cấu hình */}
        <section className="info-section">
          <div className="info-box">
            <div className="flex-row items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-success" />
              <h4 className="font-semibold">Mô hình Hoạt Động (Model A)</h4>
            </div>
            <p className="text-sm text-secondary">
              Client này đóng gói độc lập. Người dùng cài đặt app lên máy tính (Windows/macOS) và app sẽ gửi request bảo mật qua HTTP/REST tới Backend Express + PostgreSQL của bạn thông qua URL cấu hình trong file <code>.env</code> (<code>VITE_API_BASE_URL</code>).
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Desktop Web Client • React 18 + TypeScript + Vite + Electron</span>
      </footer>
    </div>
  )
}

export default App

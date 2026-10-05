# Desktop & Web React Client (Electron + Vite + TypeScript)

Source code Frontend chuẩn mô hình **Client - Server (Mô hình A)**:
- **Giao diện**: React 18 + TypeScript + Vite.
- **Đóng gói Desktop**: Electron + Electron Builder (Build ra file cài đặt `.exe`, `.dmg`, `.deb`).
- **Kết nối Backend**: Đã cấu hình Axios client và Environment Variables sẵn sàng kết nối tới **Express + PostgreSQL Backend** đang có của bạn.

---

## 🚀 1. Hướng Dẫn Bắt Đầu Nhanh

### Bước 1: Cài đặt thư viện
Mở terminal tại thư mục này và chạy:
```bash
npm install
```

### Bước 2: Cấu hình kết nối Backend Express
Mở file `.env` và cập nhật địa chỉ Backend Express của bạn:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ **Lưu ý bên Express Server**: Hãy đảm bảo bạn đã cài `cors` và cấu hình cho phép request:
> ```ts
> import cors from 'cors';
> app.use(cors()); // Cho phép gọi API từ Web và Electron
> ```

---

## 💻 2. Các Lệnh Chạy (Commands)

| Mục đích | Lệnh chạy | Mô tả |
| :--- | :--- | :--- |
| **Chạy Web thông thường** | `npm run dev` | Mở trên trình duyệt tại `http://localhost:5173` |
| **Chạy App Desktop (Dev)** | `npm run electron:dev` | Bật cửa sổ Electron Desktop để vừa code vừa test giao diện |
| **Build Web tĩnh** | `npm run build` | Tạo thư mục tĩnh `dist/` để host lên Nginx, Vercel,... |
| **Build File Cài Đặt Desktop** | `npm run electron:build` | Đóng gói ra installer cho OS hiện tại vào thư mục `release/` |
| **Build cho Windows (.exe)** | `npm run electron:build:win` | Tạo file cài đặt Setup `.exe` (NSIS) |
| **Build cho macOS (.dmg)** | `npm run electron:build:mac` | Tạo file cài đặt `.dmg` và `.zip` |
| **Build cho Linux (.deb)** | `npm run electron:build:linux` | Tạo file `.AppImage` hoặc `.deb` |

---

## 📁 3. Cấu Trúc Thư Mục

```text
desktop-web-client/
├── .env                     # File biến môi trường chứa API URL
├── electron/                # Mã nguồn tiến trình chính Electron (Main Process)
│   ├── main.ts              # Tạo cửa sổ desktop, quản lý lifecycle, IPC
│   ├── preload.ts           # Cầu nối an toàn ContextBridge (window.electronAPI)
│   └── tsconfig.json        # Cấu hình TypeScript cho Electron
├── src/                     # Mã nguồn giao diện React (Renderer Process)
│   ├── api/
│   │   └── client.ts        # Axios client có săn health-check, token interceptor
│   ├── components/
│   │   ├── ApiStatusBadge.tsx  # Widget kiểm tra trạng thái kết nối Express
│   │   ├── DataDemo.tsx        # Component mẫu thêm/xóa/đọc dữ liệu
│   │   └── DesktopControls.tsx # Nút thu nhỏ/phóng to/đóng app chuẩn desktop
│   ├── App.tsx              # Giao diện chính
│   ├── index.css            # Style tổng quan
│   └── main.tsx             # Mount React DOM
├── electron-builder.json    # Cấu hình đóng gói installer (.exe, .dmg, nsis shortcut)
├── vite.config.ts           # Cấu hình Vite với base relative path cho Electron
├── tsconfig.json            # Cấu hình TypeScript cho React
└── package.json
```

---

## 🛠️ 4. Tích Hợp Chi Tiết Với Express + PostgreSQL

Trong `src/api/client.ts`, mọi request đều đi qua `apiClient`. Bạn có thể tạo thêm các file service theo module:
Ví dụ `src/api/auth.ts`:
```ts
import { apiClient } from './client';

export const login = async (username: string, pass: string) => {
  const res = await apiClient.post('/auth/login', { username, pass });
  localStorage.setItem('auth_token', res.data.token);
  return res.data;
};
```

Mọi dữ liệu từ PostgreSQL qua các router Express (`pool.query` hoặc `prisma`) sẽ được render mượt mà trên ứng dụng Desktop và Web của bạn.

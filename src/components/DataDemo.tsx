import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { Database, Plus, Trash2, Server } from 'lucide-react'

interface Item {
  id: number | string
  title: string
  created_at?: string
}

export const DataDemo: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, title: 'Cấu hình kết nối PostgreSQL trong Express', created_at: '2026-10-05 14:00' },
    { id: 2, title: 'Tạo API GET /api/items và POST /api/items', created_at: '2026-10-05 14:15' },
    { id: 3, title: 'Build file cài đặt .exe cho Windows qua electron-builder', created_at: '2026-10-05 14:30' },
  ])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [isUsingLiveApi, setIsUsingLiveApi] = useState(false)

  // Tải dữ liệu từ Express Backend nếu có
  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/items')
      if (Array.isArray(res.data)) {
        setItems(res.data)
        setIsUsingLiveApi(true)
      }
    } catch {
      // Khi Backend chưa bật hoặc chưa có route /items, giữ nguyên danh sách mẫu
      setIsUsingLiveApi(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Thêm item mới
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newItem: Item = {
      id: Date.now(),
      title: newTitle.trim(),
      created_at: new Date().toLocaleString(),
    }

    try {
      // Gọi API POST tới Express backend
      const res = await apiClient.post('/items', { title: newTitle.trim() })
      if (res.data && res.data.id) {
        setItems((prev) => [res.data, ...prev])
        setIsUsingLiveApi(true)
      } else {
        setItems((prev) => [newItem, ...prev])
      }
    } catch {
      // Fallback lưu local trong UI khi backend chưa bật
      setItems((prev) => [newItem, ...prev])
    }

    setNewTitle('')
  }

  const handleDeleteItem = async (id: number | string) => {
    try {
      await apiClient.delete(`/items/${id}`)
    } catch {
      // ignore error if offline
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex-row items-center gap-2">
          <Database size={18} className="text-primary" />
          <h3 className="card-title">Demo Tương Tác Dữ Liệu (PostgreSQL & Express API)</h3>
        </div>
        <span className={`badge ${isUsingLiveApi ? 'badge-success' : 'badge-neutral'}`}>
          {isUsingLiveApi ? 'Dữ liệu từ Express API thực tế' : 'Dữ liệu Demo Frontend'}
        </span>
      </div>

      <form onSubmit={handleAddItem} className="add-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nhập tiêu đề hoặc công việc cần lưu..."
          className="input"
        />
        <button type="submit" className="btn btn-primary" disabled={!newTitle.trim()}>
          <Plus size={16} /> Thêm Mới
        </button>
      </form>

      <div className="item-list">
        {loading ? (
          <p className="text-muted text-center py-4">Đang tải dữ liệu...</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-center py-4">Chưa có bản ghi nào.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="item-row">
              <div>
                <p className="item-title">{item.title}</p>
                {item.created_at && <span className="item-date">{item.created_at}</span>}
              </div>
              <button
                className="btn-delete"
                onClick={() => handleDeleteItem(item.id)}
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="hint-box">
        <div className="flex-row items-center gap-2 mb-1">
          <Server size={14} className="text-primary" />
          <strong>Gợi ý cài đặt bên Express API của bạn:</strong>
        </div>
        <pre className="code-block">
{`// Trong file server Express của bạn:
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Connected to Postgres' }));
app.get('/api/items', async (req, res) => {
  // const items = await pool.query('SELECT * FROM items ORDER BY id DESC');
  // res.json(items.rows);
});`}
        </pre>
      </div>
    </div>
  )
}

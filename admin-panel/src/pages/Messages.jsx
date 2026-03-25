import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 30;

  useEffect(() => { loadMessages(); }, [page]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/messages', { params: { page, limit } });
      setMessages(res.data.data.messages || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <span className="badge">{total} total</span>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Match ID</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Status</th>
                  <th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.Sender?.firstName} {m.Sender?.lastName}</td>
                    <td>{m.matchId}</td>
                    <td><span className="tag">{m.messageType || 'text'}</span></td>
                    <td className="truncate">{m.content || m.text || '—'}</td>
                    <td>{m.isRead ? '✅ Read' : '📩 Sent'}</td>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr><td colSpan="7" className="empty">No messages found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} of {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

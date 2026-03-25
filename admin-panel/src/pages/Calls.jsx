import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 20;

  useEffect(() => { loadCalls(); }, [page, typeFilter]);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/calls', { params: { page, limit, callType: typeFilter || undefined } });
      setCalls(res.data.data.calls || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Call History</h1>
        <span className="badge">{total} total</span>
      </div>

      <div className="filters">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="voice">Voice</option>
          <option value="video">Video</option>
        </select>
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
                  <th>Caller</th>
                  <th>Receiver</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>End Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.Caller?.firstName} {c.Caller?.lastName}</td>
                    <td>{c.Receiver?.firstName} {c.Receiver?.lastName}</td>
                    <td><span className="tag">{c.callType === 'video' ? '📹' : '📞'} {c.callType}</span></td>
                    <td><span className={`status-dot ${c.status}`}>{c.status}</span></td>
                    <td>{formatDuration(c.duration)}</td>
                    <td>{c.endReason || '—'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {calls.length === 0 && (
                  <tr><td colSpan="8" className="empty">No calls found</td></tr>
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

import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 20;

  useEffect(() => { loadMatches(); }, [page, statusFilter]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/matches', { params: { page, limit, status: statusFilter || undefined } });
      setMatches(res.data.data.matches || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Matches</h1>
        <span className="badge">{total} total</span>
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="mutual_match">Mutual Match</option>
          <option value="rejected">Rejected</option>
          <option value="unmatched">Unmatched</option>
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
                  <th>User</th>
                  <th>Matched With</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td className="user-cell">
                      <span>{m.Initiator?.firstName} {m.Initiator?.lastName}</span>
                    </td>
                    <td className="user-cell">
                      <span>{m.MatchedUser?.firstName} {m.MatchedUser?.lastName}</span>
                    </td>
                    <td>
                      <span className={`status-dot ${m.status === 'mutual_match' ? 'active' : m.status}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {matches.length === 0 && (
                  <tr><td colSpan="5" className="empty">No matches found</td></tr>
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

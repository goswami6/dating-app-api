import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 20;

  useEffect(() => { loadTransactions(); }, [page, typeFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/wallet/transactions', { params: { page, limit, type: typeFilter || undefined } });
      setTransactions(res.data.data.transactions || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Wallet Transactions</h1>
        <span className="badge">{total} total</span>
      </div>

      <div className="filters">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="recharge">Recharge</option>
          <option value="chat_deduction">Chat</option>
          <option value="voice_call_deduction">Voice Call</option>
          <option value="video_call_deduction">Video Call</option>
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
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.User?.firstName} {t.User?.lastName}</td>
                    <td><span className="tag">{t.type}</span></td>
                    <td className={t.amount > 0 ? 'text-green' : 'text-red'}>
                      {t.amount > 0 ? '+' : ''}₹{t.amount}
                    </td>
                    <td>₹{t.balanceAfter}</td>
                    <td className="truncate">{t.description || '—'}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan="7" className="empty">No transactions found</td></tr>
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

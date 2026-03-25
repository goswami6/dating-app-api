import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Shop() {
  const [tab, setTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { loadData(); }, [tab, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'products' ? '/admin/shop/products' :
        tab === 'categories' ? '/admin/shop/categories' :
          '/admin/shop/orders';
      const res = await api.get(endpoint, { params: { page, limit } });
      setItems(res.data.data[tab] || res.data.data.items || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error(`Failed to load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Shop Management</h1>
        <span className="badge">{total} total</span>
      </div>

      <div className="tabs">
        {['products', 'categories', 'orders'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setPage(1); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {tab === 'products' && <><th>ID</th><th>Icon</th><th>Name</th><th>Price</th><th>Category</th><th>Active</th></>}
                  {tab === 'categories' && <><th>ID</th><th>Name</th><th>Slug</th><th>Active</th><th>Sort</th></>}
                  {tab === 'orders' && <><th>ID</th><th>User</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {tab === 'products' && (
                      <>
                        <td>{item.id}</td>
                        <td>{item.icon || '📦'}</td>
                        <td>{item.name}</td>
                        <td>₹{item.price}</td>
                        <td>{item.Category?.name || '—'}</td>
                        <td>{item.isActive ? '✅' : '❌'}</td>
                      </>
                    )}
                    {tab === 'categories' && (
                      <>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.slug}</td>
                        <td>{item.isActive ? '✅' : '❌'}</td>
                        <td>{item.sortOrder}</td>
                      </>
                    )}
                    {tab === 'orders' && (
                      <>
                        <td>{item.id}</td>
                        <td>{item.User?.firstName} {item.User?.lastName}</td>
                        <td>₹{item.totalAmount}</td>
                        <td><span className={`status-dot ${item.status}`}>{item.status}</span></td>
                        <td>{item.paymentMethod || '—'}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </>
                    )}
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="empty">No {tab} found</td></tr>
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

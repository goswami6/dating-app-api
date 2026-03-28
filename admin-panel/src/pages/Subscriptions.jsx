import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

const emptyPlan = { name: '', tagline: '', duration: 7, price: '', currency: 'INR', features: '', isActive: true };

export default function Subscriptions() {
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPage(1); }, [tab, statusFilter]);
  useEffect(() => { load(); }, [tab, page, statusFilter]);

  const load = async () => {
    try {
      if (tab === 'plans') {
        const res = await api.get('/admin/subscriptions/plans', { params: { page, limit } });
        setPlans(res.data.data.plans);
        setTotal(res.data.data.total);
      } else {
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        const res = await api.get('/admin/subscriptions', { params });
        setSubs(res.data.data.subscriptions);
        setTotal(res.data.data.total);
      }
    } catch {
      toast.error('Failed to load data');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlan);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      tagline: plan.tagline || '',
      duration: plan.duration,
      price: plan.price,
      currency: plan.currency || 'INR',
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.duration || !form.price) {
      return toast.error('Name, duration and price are required');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        duration: parseInt(form.duration),
        price: parseFloat(form.price),
        currency: form.currency,
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/admin/subscriptions/plans/${editing.id}`, payload);
        toast.success('Plan updated');
      } else {
        await api.post('/admin/subscriptions/plans', payload);
        toast.success('Plan created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.delete(`/admin/subscriptions/plans/${id}`);
      toast.success('Plan deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await api.put(`/admin/subscriptions/plans/${plan.id}`, { isActive: !plan.isActive });
      toast.success(plan.isActive ? 'Plan deactivated' : 'Plan activated');
      load();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Subscriptions</h1>
        <span className="badge">{total}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Plans</button>
        <button className={`tab ${tab === 'subscribers' ? 'active' : ''}`} onClick={() => setTab('subscribers')}>Subscribers</button>
      </div>

      {tab === 'plans' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn-sm btn-success" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={openCreate}>
              + Add Plan
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Tagline</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Features</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan="8" className="empty">No plans found</td></tr>
                ) : plans.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td className="truncate">{p.tagline || '—'}</td>
                    <td>{p.duration} days</td>
                    <td className="text-green">₹{p.price}</td>
                    <td className="truncate">{Array.isArray(p.features) ? p.features.join(', ') : '—'}</td>
                    <td>{p.isActive ? <span className="status-dot active">Active</span> : <span className="status-dot suspended">Inactive</span>}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn-sm" onClick={() => handleToggleActive(p)}>{p.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'subscribers' && (
        <>
          <div className="filters">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr><td colSpan="7" className="empty">No subscriptions found</td></tr>
                ) : subs.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.Subscriber ? `${s.Subscriber.firstName} ${s.Subscriber.lastName}` : `User #${s.userId}`}</td>
                    <td>{s.Plan ? s.Plan.name : `Plan #${s.planId}`}</td>
                    <td className="text-green">{s.Plan ? `₹${s.Plan.price}` : '—'}</td>
                    <td>{new Date(s.startDate).toLocaleDateString()}</td>
                    <td>{new Date(s.endDate).toLocaleDateString()}</td>
                    <td><span className={`status-dot ${s.status}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Plan' : 'Create Plan'}</h2>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Plan Name *</span>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} placeholder="e.g. Tinder Gold" />
                </label>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Tagline</span>
                  <input type="text" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} placeholder="e.g. See Who Likes You" />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Duration (days) *</span>
                    <input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Price (₹) *</span>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Currency</span>
                    <input type="text" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} />
                  </label>
                </div>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Features (comma-separated)</span>
                  <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })}
                    rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4, resize: 'vertical' }}
                    placeholder="Unlimited Likes, Rewinds, See Who Likes You" />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Active</span>
                </label>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                  <button type="button" className="btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-success" disabled={saving}
                    style={{ padding: '8px 22px' }}>{saving ? 'Saving...' : editing ? 'Update Plan' : 'Create Plan'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

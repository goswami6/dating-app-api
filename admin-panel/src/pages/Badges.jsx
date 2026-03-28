import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

const emptyBadge = { name: '', icon: '', description: '', requiredMonth: 0, color: '#FF4081', isPremium: false };

export default function Badges() {
  const [tab, setTab] = useState('badges');
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [badgeFilter, setBadgeFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Badge CRUD modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBadge);
  const [saving, setSaving] = useState(false);

  // Award modal
  const [showAward, setShowAward] = useState(false);
  const [awardForm, setAwardForm] = useState({ userId: '', badgeId: '' });
  const [allBadges, setAllBadges] = useState([]);

  useEffect(() => { setPage(1); }, [tab, badgeFilter, searchFilter]);
  useEffect(() => { load(); }, [tab, page, badgeFilter, searchFilter]);

  const load = async () => {
    try {
      if (tab === 'badges') {
        const res = await api.get('/admin/badges', { params: { page, limit } });
        setBadges(res.data.data.badges);
        setTotal(res.data.data.total);
      } else {
        const params = { page, limit };
        if (badgeFilter) params.badgeId = badgeFilter;
        if (searchFilter) params.search = searchFilter;
        const res = await api.get('/admin/badges/users', { params });
        setUserBadges(res.data.data.userBadges);
        setTotal(res.data.data.total);
      }
    } catch {
      toast.error('Failed to load data');
    }
  };

  const loadAllBadges = async () => {
    try {
      const res = await api.get('/admin/badges', { params: { page: 1, limit: 100 } });
      setAllBadges(res.data.data.badges);
    } catch { }
  };

  // ─── Badge CRUD ─────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(emptyBadge);
    setShowModal(true);
  };

  const openEdit = (badge) => {
    setEditing(badge);
    setForm({
      name: badge.name,
      icon: badge.icon,
      description: badge.description || '',
      requiredMonth: badge.requiredMonth || 0,
      color: badge.color || '#FF4081',
      isPremium: badge.isPremium || false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.icon) return toast.error('Name and icon are required');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        icon: form.icon,
        description: form.description,
        requiredMonth: parseInt(form.requiredMonth) || 0,
        color: form.color,
        isPremium: form.isPremium,
      };
      if (editing) {
        await api.put(`/admin/badges/${editing.id}`, payload);
        toast.success('Badge updated');
      } else {
        await api.post('/admin/badges', payload);
        toast.success('Badge created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save badge');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this badge? All user awards will also be removed.')) return;
    try {
      await api.delete(`/admin/badges/${id}`);
      toast.success('Badge deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // ─── Award / Revoke ─────────────────────

  const openAward = () => {
    loadAllBadges();
    setAwardForm({ userId: '', badgeId: '' });
    setShowAward(true);
  };

  const handleAward = async (e) => {
    e.preventDefault();
    if (!awardForm.userId || !awardForm.badgeId) return toast.error('Select user ID and badge');
    setSaving(true);
    try {
      await api.post('/admin/badges/award', {
        userId: parseInt(awardForm.userId),
        badgeId: parseInt(awardForm.badgeId),
      });
      toast.success('Badge awarded to user');
      setShowAward(false);
      if (tab === 'awarded') load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to award badge');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (userId, badgeId) => {
    if (!confirm('Revoke this badge from user?')) return;
    try {
      await api.delete(`/admin/badges/revoke/${userId}/${badgeId}`);
      toast.success('Badge revoked');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke');
    }
  };

  return (
    <div className="table-page">
      <div className="page-header">
        <h1>Badge Management</h1>
        <span className="badge">{total}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'badges' ? 'active' : ''}`} onClick={() => setTab('badges')}>Badges</button>
        <button className={`tab ${tab === 'awarded' ? 'active' : ''}`} onClick={() => setTab('awarded')}>Awarded</button>
      </div>

      {/* ─── Badges Tab ──── */}
      {tab === 'badges' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <button className="btn-sm btn-success" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={openCreate}>
              + Create Badge
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Badge</th>
                  <th>Icon</th>
                  <th>Description</th>
                  <th>Req. Months</th>
                  <th>Color</th>
                  <th>Premium</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.length === 0 ? (
                  <tr><td colSpan="8" className="empty">No badges found</td></tr>
                ) : badges.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td><strong>{b.name}</strong></td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '50%', backgroundColor: b.color || '#FF4081',
                        color: '#fff', fontSize: 14, fontWeight: 700
                      }}>{b.icon?.charAt(0).toUpperCase()}</span>
                      <span style={{ marginLeft: 6, fontSize: '0.8rem', color: '#888' }}>{b.icon}</span>
                    </td>
                    <td className="truncate">{b.description || '—'}</td>
                    <td>{b.requiredMonth || 0}</td>
                    <td>
                      <span style={{
                        display: 'inline-block', width: 20, height: 20, borderRadius: 4,
                        backgroundColor: b.color || '#FF4081', border: '1px solid #ddd', verticalAlign: 'middle'
                      }} />
                      <span style={{ marginLeft: 6, fontSize: '0.8rem' }}>{b.color}</span>
                    </td>
                    <td>{b.isPremium ? <span className="status-dot active">Premium</span> : <span style={{ color: '#999' }}>No</span>}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-sm" onClick={() => openEdit(b)}>Edit</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── Awarded Tab ──── */}
      {tab === 'awarded' && (
        <>
          <div className="filters" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text" placeholder="Search user (name/email)..." value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, minWidth: 200 }}
            />
            <select value={badgeFilter} onChange={e => setBadgeFilter(e.target.value)}>
              <option value="">All Badges</option>
              {badges.length > 0 ? badges.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              )) : null}
            </select>
            <button className="btn-sm btn-success" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={openAward}>
              + Award Badge
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Badge</th>
                  <th>Earned At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userBadges.length === 0 ? (
                  <tr><td colSpan="5" className="empty">No awarded badges found</td></tr>
                ) : userBadges.map(ub => (
                  <tr key={ub.id}>
                    <td>{ub.id}</td>
                    <td>{ub.User ? `${ub.User.firstName} ${ub.User.lastName}` : `User #${ub.userId}`}
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{ub.User?.email}</div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%',
                        backgroundColor: ub.Badge?.color || '#FF4081', color: '#fff',
                        fontSize: 11, fontWeight: 700, marginRight: 6
                      }}>{ub.Badge?.icon?.charAt(0).toUpperCase()}</span>
                      {ub.Badge ? ub.Badge.name : `Badge #${ub.badgeId}`}
                    </td>
                    <td>{new Date(ub.earnedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-sm btn-danger" onClick={() => handleRevoke(ub.userId, ub.badgeId)}>Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {/* ─── Create / Edit Badge Modal ──── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Badge' : 'Create Badge'}</h2>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Badge Name *</span>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }}
                    placeholder="e.g. Verified" />
                </label>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Icon *</span>
                  <input type="text" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }}
                    placeholder="e.g. verified, star, diamond, crown" />
                </label>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Description</span>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={2} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4, resize: 'vertical' }}
                    placeholder="Describe what this badge represents" />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Required Months</span>
                    <input type="number" min="0" value={form.requiredMonth} onChange={e => setForm({ ...form, requiredMonth: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }} />
                  </label>
                  <label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Color</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                        style={{ width: 40, height: 38, border: 'none', cursor: 'pointer' }} />
                      <input type="text" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                        style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8 }}
                        placeholder="#FF4081" />
                    </div>
                  </label>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={form.isPremium} onChange={e => setForm({ ...form, isPremium: e.target.checked })} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Premium Only</span>
                </label>
                {/* Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8f8f8', borderRadius: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: '50%', backgroundColor: form.color || '#FF4081',
                    color: '#fff', fontSize: 16, fontWeight: 700
                  }}>{(form.icon || '?').charAt(0).toUpperCase()}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{form.name || 'Badge Preview'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{form.description || 'No description'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                  <button type="button" className="btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-success" disabled={saving}
                    style={{ padding: '8px 22px' }}>{saving ? 'Saving...' : editing ? 'Update Badge' : 'Create Badge'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Award Badge Modal ──── */}
      {showAward && (
        <div className="modal-overlay" onClick={() => setShowAward(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Award Badge to User</h2>
              <button onClick={() => setShowAward(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAward} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>User ID *</span>
                  <input type="number" min="1" value={awardForm.userId}
                    onChange={e => setAwardForm({ ...awardForm, userId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }}
                    placeholder="Enter user ID" />
                </label>
                <label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Badge *</span>
                  <select value={awardForm.badgeId} onChange={e => setAwardForm({ ...awardForm, badgeId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, marginTop: 4 }}>
                    <option value="">Select a badge</option>
                    {allBadges.map(b => (
                      <option key={b.id} value={b.id}>{b.name} {b.isPremium ? '(Premium)' : ''}</option>
                    ))}
                  </select>
                </label>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                  <button type="button" className="btn-sm" onClick={() => setShowAward(false)}>Cancel</button>
                  <button type="submit" className="btn-sm btn-success" disabled={saving}
                    style={{ padding: '8px 22px' }}>{saving ? 'Awarding...' : 'Award Badge'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

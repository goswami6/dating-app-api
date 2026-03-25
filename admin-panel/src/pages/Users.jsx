import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const limit = 20;

  useEffect(() => { loadUsers(); }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit, search } });
      setUsers(res.data.data.users || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const toggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate';
    try {
      await api.patch(`/users/${userId}/${action}`);
      toast.success(`User ${action}d`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <span className="badge">{total} total</span>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

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
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Premium</th>
                  <th>Online</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="user-cell">
                      <img
                        src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.firstName}+${u.lastName}&background=e84393&color=fff`}
                        alt=""
                        className="avatar"
                      />
                      <span>{u.firstName} {u.lastName}</span>
                    </td>
                    <td>{u.email}</td>
                    <td><span className="tag">{u.gender || '—'}</span></td>
                    <td>{u.age || '—'}</td>
                    <td>
                      <span className={`status-dot ${u.accountStatus}`}>{u.accountStatus}</span>
                    </td>
                    <td>{u.isPremium ? '⭐' : '—'}</td>
                    <td>{u.isOnline ? '🟢' : '⚫'}</td>
                    <td className="actions">
                      <button className="btn-sm" onClick={() => setSelected(u)}>View</button>
                      <button
                        className={`btn-sm ${u.accountStatus === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleStatus(u.id, u.accountStatus)}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="9" className="empty">No users found</td></tr>
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

      {/* User Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>ID:</strong> {selected.id}</div>
                <div><strong>Name:</strong> {selected.firstName} {selected.lastName}</div>
                <div><strong>Email:</strong> {selected.email}</div>
                <div><strong>Phone:</strong> {selected.phoneNumber || '—'}</div>
                <div><strong>Gender:</strong> {selected.gender || '—'}</div>
                <div><strong>Age:</strong> {selected.age || '—'}</div>
                <div><strong>Location:</strong> {selected.location || '—'}</div>
                <div><strong>Status:</strong> {selected.accountStatus}</div>
                <div><strong>Premium:</strong> {selected.isPremium ? 'Yes' : 'No'}</div>
                <div><strong>Verified:</strong> {selected.isVerified ? 'Yes' : 'No'}</div>
                <div><strong>Occupation:</strong> {selected.occupation || '—'}</div>
                <div><strong>Education:</strong> {selected.education || '—'}</div>
                <div><strong>Looking For:</strong> {selected.lookingFor || '—'}</div>
                <div><strong>Joined:</strong> {new Date(selected.createdAt).toLocaleDateString()}</div>
              </div>
              {selected.bio && (
                <div className="detail-bio">
                  <strong>Bio:</strong>
                  <p>{selected.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

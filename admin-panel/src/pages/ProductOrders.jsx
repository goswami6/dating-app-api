import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Pending', icon: '🕐' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'processing', label: 'Processing', icon: '⚙️' },
  { key: 'shipped', label: 'Shipped', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📦' },
];

function getStepIndex(status) {
  const idx = TIMELINE_STEPS.findIndex(s => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function ProductOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail view
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPage(1); }, [statusFilter, paymentFilter]);
  useEffect(() => { loadOrders(); }, [page, statusFilter, paymentFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      const res = await api.get('/admin/shop/orders', { params });
      setOrders(res.data.data.orders || []);
      setTotal(res.data.data.total || 0);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // ─── Load detail ────────────────────────

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/shop/orders/${id}`);
      const o = res.data.data;
      setSelected(o);
      setNewStatus(o.status);
      setNewPayment(o.paymentStatus);
      setCancelReason('');
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setSelected(null);

  // ─── Update status ──────────────────────

  const handleSaveStatus = async () => {
    if (!selected) return;
    if (newStatus === 'cancelled' && !cancelReason.trim()) return toast.error('Please enter a cancel reason');
    setSaving(true);
    try {
      const payload = { status: newStatus, paymentStatus: newPayment };
      if (newStatus === 'cancelled') payload.cancelReason = cancelReason;
      await api.put(`/admin/shop/orders/${selected.id}/status`, payload);
      toast.success('Order updated');
      await openDetail(selected.id);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  // ─── Quick actions ──────────────────────

  const quickAction = async (id, status) => {
    try {
      await api.put(`/admin/shop/orders/${id}/status`, { status });
      toast.success(`Order marked as ${status}`);
      loadOrders();
      if (selected?.id === id) openDetail(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // ─── Stats ──────────────────────────────

  const statusCounts = {};
  ORDER_STATUSES.forEach(s => { statusCounts[s] = 0; });
  // We can't count from the current page only, but we'll show the filter
  // The real counts would need a stats endpoint

  // ─── Filtered by search ─────────────────

  const displayed = searchQuery.trim()
    ? orders.filter(o =>
      (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${o.User?.firstName || ''} ${o.User?.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : orders;

  // ─── Render ─────────────────────────────

  return (
    <div className="table-page">
      {/* ─── List View ─────────────────────── */}
      {!selected ? (
        <>
          <div className="page-header">
            <h1 className="page-title">Product Orders</h1>
            <span className="badge">{total} orders</span>
          </div>

          {/* Filters */}
          <div className="orders-toolbar">
            <input
              className="orders-search"
              placeholder="Search by order # or customer name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
              <option value="">All Payments</option>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(order => (
                      <tr key={order.id} className="order-row" onClick={() => openDetail(order.id)}>
                        <td><strong>{order.orderNumber || `#${order.id}`}</strong></td>
                        <td>
                          <div>{order.User?.firstName} {order.User?.lastName}</div>
                        </td>
                        <td>{order.Items?.length || '—'}</td>
                        <td><strong>₹{order.totalAmount}</strong></td>
                        <td>
                          <span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span>
                          <small style={{ display: 'block', color: '#888', marginTop: 2 }}>{order.paymentMethod?.toUpperCase()}</small>
                        </td>
                        <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {order.status === 'pending' && (
                              <button className="btn-sm btn-success" onClick={() => quickAction(order.id, 'confirmed')}>Confirm</button>
                            )}
                            {order.status === 'confirmed' && (
                              <button className="btn-sm btn-primary" onClick={() => quickAction(order.id, 'processing')}>Process</button>
                            )}
                            {order.status === 'processing' && (
                              <button className="btn-sm btn-primary" onClick={() => quickAction(order.id, 'shipped')}>Ship</button>
                            )}
                            {order.status === 'shipped' && (
                              <button className="btn-sm btn-success" onClick={() => quickAction(order.id, 'delivered')}>Delivered</button>
                            )}
                            <button className="btn-sm" onClick={() => openDetail(order.id)}>Details</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {displayed.length === 0 && (
                      <tr><td colSpan="8" className="empty">No orders found</td></tr>
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
        </>
      ) : (
        /* ─── Detail View ────────────────────── */
        <>
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-sm" onClick={closeDetail}>← Back</button>
              <h1 className="page-title" style={{ margin: 0 }}>Order {selected.orderNumber || `#${selected.id}`}</h1>
              <span className={`status-badge status-${selected.status}`}>{selected.status}</span>
            </div>
          </div>

          {detailLoading ? (
            <div className="loading">Loading order details...</div>
          ) : (
            <div className="order-detail-grid">
              {/* ─── Timeline ─────────────────── */}
              {!['cancelled', 'returned', 'refunded'].includes(selected.status) && (
                <div className="order-card order-timeline-card">
                  <h3>Order Progress</h3>
                  <div className="order-timeline">
                    {TIMELINE_STEPS.map((step, i) => {
                      const current = getStepIndex(selected.status);
                      const done = i <= current;
                      const active = i === current;
                      return (
                        <div key={step.key} className={`timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                          <div className="timeline-icon">{step.icon}</div>
                          <div className="timeline-label">{step.label}</div>
                          {i < TIMELINE_STEPS.length - 1 && <div className={`timeline-line ${i < current ? 'done' : ''}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {['cancelled', 'returned', 'refunded'].includes(selected.status) && (
                <div className="order-card" style={{ background: '#fff5f5', borderColor: '#fcc' }}>
                  <h3 style={{ color: '#c0392b' }}>
                    {selected.status === 'cancelled' ? '❌ Order Cancelled' : selected.status === 'returned' ? '↩️ Order Returned' : '💸 Order Refunded'}
                  </h3>
                  {selected.cancelReason && <p style={{ color: '#666', margin: '6px 0 0' }}><strong>Reason:</strong> {selected.cancelReason}</p>}
                  {selected.cancelledAt && <p style={{ color: '#888', fontSize: '0.85rem' }}>Cancelled on {new Date(selected.cancelledAt).toLocaleString()}</p>}
                </div>
              )}

              {/* ─── Customer & Address (side by side) */}
              <div className="order-detail-row">
                <div className="order-card">
                  <h3>Customer</h3>
                  <p><strong>{selected.User?.firstName} {selected.User?.lastName}</strong></p>
                  <p style={{ color: '#666' }}>{selected.User?.email}</p>
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>User ID: {selected.userId}</p>
                </div>
                <div className="order-card">
                  <h3>Shipping Address</h3>
                  {selected.Address ? (
                    <>
                      <p><strong>{selected.Address.fullName}</strong></p>
                      <p>{selected.Address.addressLine1}</p>
                      {selected.Address.addressLine2 && <p>{selected.Address.addressLine2}</p>}
                      <p>{selected.Address.city}, {selected.Address.state} {selected.Address.postalCode}</p>
                      <p>{selected.Address.country} &middot; {selected.Address.phone}</p>
                    </>
                  ) : (
                    <p style={{ color: '#999' }}>No address on file</p>
                  )}
                </div>
              </div>

              {/* ─── Order Items ──────────────── */}
              <div className="order-card">
                <h3>Order Items</h3>
                <div className="table-wrapper" style={{ boxShadow: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU / Attributes</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.Items || []).map(item => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {item.productImage && <img src={item.productImage} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />}
                              <div>
                                <strong>{item.Product?.name || item.productName}</strong>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: '#888', fontSize: '0.82rem' }}>
                            {item.selectedAttributes
                              ? (typeof item.selectedAttributes === 'object'
                                ? Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')
                                : item.selectedAttributes)
                              : '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                          <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                          <td style={{ textAlign: 'right' }}><strong>₹{item.total}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="order-totals">
                  <div className="order-total-row">
                    <span>Subtotal</span><span>₹{selected.subtotal}</span>
                  </div>
                  {parseFloat(selected.discount) > 0 && (
                    <div className="order-total-row" style={{ color: '#27ae60' }}>
                      <span>Discount {selected.couponCode && <small>({selected.couponCode})</small>}</span><span>-₹{selected.discount}</span>
                    </div>
                  )}
                  {parseFloat(selected.shippingCharge) > 0 && (
                    <div className="order-total-row">
                      <span>Shipping</span><span>₹{selected.shippingCharge}</span>
                    </div>
                  )}
                  {parseFloat(selected.tax) > 0 && (
                    <div className="order-total-row">
                      <span>Tax</span><span>₹{selected.tax}</span>
                    </div>
                  )}
                  <div className="order-total-row order-grand-total">
                    <span>Total</span><span>₹{selected.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* ─── Payment Info ─────────────── */}
              <div className="order-detail-row">
                <div className="order-card">
                  <h3>Payment</h3>
                  <div className="order-info-grid">
                    <div><span className="info-label">Method</span><span>{selected.paymentMethod?.toUpperCase()}</span></div>
                    <div><span className="info-label">Status</span><span className={`status-badge status-${selected.paymentStatus}`}>{selected.paymentStatus}</span></div>
                    <div><span className="info-label">Currency</span><span>{selected.currency || 'INR'}</span></div>
                  </div>
                </div>
                <div className="order-card">
                  <h3>Dates</h3>
                  <div className="order-info-grid">
                    <div><span className="info-label">Ordered</span><span>{new Date(selected.createdAt).toLocaleString()}</span></div>
                    {selected.shippedAt && <div><span className="info-label">Shipped</span><span>{new Date(selected.shippedAt).toLocaleString()}</span></div>}
                    {selected.deliveredAt && <div><span className="info-label">Delivered</span><span>{new Date(selected.deliveredAt).toLocaleString()}</span></div>}
                    {selected.cancelledAt && <div><span className="info-label">Cancelled</span><span>{new Date(selected.cancelledAt).toLocaleString()}</span></div>}
                  </div>
                </div>
              </div>

              {/* ─── Notes ────────────────────── */}
              {selected.notes && (
                <div className="order-card">
                  <h3>Customer Notes</h3>
                  <p style={{ color: '#555' }}>{selected.notes}</p>
                </div>
              )}

              {/* ─── Status Update ────────────── */}
              <div className="order-card order-status-card">
                <h3>Update Order</h3>
                <div className="form-grid-2">
                  <label>
                    Order Status
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </label>
                  <label>
                    Payment Status
                    <select value={newPayment} onChange={e => setNewPayment(e.target.value)}>
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </label>
                </div>
                {newStatus === 'cancelled' && (
                  <label style={{ marginTop: 8 }}>
                    Cancel Reason *
                    <textarea rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." />
                  </label>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="btn-sm btn-primary" onClick={handleSaveStatus} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {/* Quick action buttons */}
                  {selected.status === 'pending' && (
                    <button className="btn-sm btn-success" onClick={() => { setNewStatus('confirmed'); }}>→ Confirm</button>
                  )}
                  {selected.status === 'confirmed' && (
                    <button className="btn-sm" style={{ borderColor: '#0984e3', color: '#0984e3' }} onClick={() => { setNewStatus('processing'); }}>→ Processing</button>
                  )}
                  {selected.status === 'processing' && (
                    <button className="btn-sm" style={{ borderColor: '#0984e3', color: '#0984e3' }} onClick={() => { setNewStatus('shipped'); }}>→ Ship Order</button>
                  )}
                  {selected.status === 'shipped' && (
                    <button className="btn-sm btn-success" onClick={() => { setNewStatus('delivered'); }}>→ Mark Delivered</button>
                  )}
                  {!['cancelled', 'delivered', 'returned', 'refunded'].includes(selected.status) && (
                    <button className="btn-sm btn-danger" onClick={() => { setNewStatus('cancelled'); }}>Cancel Order</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

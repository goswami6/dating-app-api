import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import './Table.css';
import './Payments.css';

const DEFAULT_GATEWAY_FORM = {
  displayName: '',
  isEnabled: false,
  isSandbox: true,
  config: {}
};

export default function Payments() {
  const [gateways, setGateways] = useState([]);
  const [gatewayForms, setGatewayForms] = useState({});
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingGateway, setSavingGateway] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(0);
  const [filters, setFilters] = useState({ gateway: '', status: '', search: '' });

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    loadGateways();
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const params = {
        page,
        limit,
        gateway: filters.gateway || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      };
      const res = await api.get('/admin/payments/orders', { params });
      setOrders(res.data.data.orders || []);
      setTotal(res.data.data.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment orders');
    } finally {
      setLoadingOrders(false);
    }
  }, [page, limit, filters.gateway, filters.status, filters.search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadGateways = async () => {
    setLoadingGateways(true);
    try {
      const res = await api.get('/admin/payments/gateways');
      const rows = res.data.data || [];
      setGateways(rows);

      const formMap = {};
      rows.forEach((gateway) => {
        formMap[gateway.gateway] = {
          displayName: gateway.displayName || gateway.gateway,
          isEnabled: !!gateway.isEnabled,
          isSandbox: gateway.isSandbox !== false,
          config: gateway.config || {}
        };
      });
      setGatewayForms(formMap);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment gateways');
    } finally {
      setLoadingGateways(false);
    }
  };

  const onGatewayFieldChange = (gateway, key, value) => {
    setGatewayForms((prev) => ({
      ...prev,
      [gateway]: {
        ...(prev[gateway] || DEFAULT_GATEWAY_FORM),
        [key]: value
      }
    }));
  };

  const onGatewayConfigChange = (gateway, key, value) => {
    setGatewayForms((prev) => ({
      ...prev,
      [gateway]: {
        ...(prev[gateway] || DEFAULT_GATEWAY_FORM),
        config: {
          ...((prev[gateway] || DEFAULT_GATEWAY_FORM).config || {}),
          [key]: value
        }
      }
    }));
  };

  const saveGateway = async (gateway) => {
    const payload = gatewayForms[gateway];
    if (!payload) return;

    setSavingGateway(gateway);
    try {
      await api.put(`/admin/payments/gateways/${gateway}`, payload);
      toast.success(`${gateway.toUpperCase()} config saved`);
      await loadGateways();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update gateway');
    } finally {
      setSavingGateway('');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/admin/payments/orders/${orderId}/status`, { status });
      toast.success(`Order #${orderId} updated to ${status}`);
      await loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingOrderId(0);
    }
  };

  const searchableOrders = useMemo(() => {
    if (!filters.search?.trim()) return orders;
    const q = filters.search.trim().toLowerCase();
    return orders.filter((o) =>
      String(o.id).includes(q)
      || (o.providerOrderId || '').toLowerCase().includes(q)
      || (o.providerPaymentId || '').toLowerCase().includes(q)
      || `${o.User?.firstName || ''} ${o.User?.lastName || ''}`.toLowerCase().includes(q)
      || (o.User?.email || '').toLowerCase().includes(q)
    );
  }, [orders, filters.search]);

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <span className="badge">Razorpay + PayU</span>
      </div>

      {loadingGateways ? (
        <div className="loading">Loading gateway configs...</div>
      ) : (
        <div className="gateway-grid">
          {gateways.map((g) => {
            const form = gatewayForms[g.gateway] || DEFAULT_GATEWAY_FORM;
            return (
              <div key={g.gateway} className="gateway-card">
                <div className="gateway-head">
                  <h3 className="gateway-title">{g.gateway === 'razorpay' ? 'Razorpay' : 'PayU'}</h3>
                  <span className={`gateway-state ${form.isEnabled ? 'enabled' : 'disabled'}`}>
                    {form.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="gateway-form">
                  <div className="gateway-inline">
                    <label>
                      Display Name
                      <input
                        type="text"
                        value={form.displayName || ''}
                        onChange={(e) => onGatewayFieldChange(g.gateway, 'displayName', e.target.value)}
                        placeholder="Gateway display name"
                      />
                    </label>
                    <label>
                      Mode
                      <select
                        value={form.isSandbox ? 'sandbox' : 'live'}
                        onChange={(e) => onGatewayFieldChange(g.gateway, 'isSandbox', e.target.value === 'sandbox')}
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="live">Live</option>
                      </select>
                    </label>
                  </div>

                  <div className="gateway-inline">
                    <label>
                      Status
                      <select
                        value={form.isEnabled ? 'enabled' : 'disabled'}
                        onChange={(e) => onGatewayFieldChange(g.gateway, 'isEnabled', e.target.value === 'enabled')}
                      >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </label>
                    <div />
                  </div>

                  {g.gateway === 'razorpay' ? (
                    <>
                      <label>
                        Key ID
                        <input
                          type="text"
                          value={form.config?.keyId || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'keyId', e.target.value)}
                          placeholder="rzp_test_..."
                        />
                      </label>
                      <label>
                        Key Secret
                        <input
                          type="text"
                          value={form.config?.keySecret || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'keySecret', e.target.value)}
                          placeholder="Enter Razorpay key secret"
                        />
                      </label>
                      <label>
                        Webhook Secret
                        <input
                          type="text"
                          value={form.config?.webhookSecret || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'webhookSecret', e.target.value)}
                          placeholder="Optional"
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      <label>
                        Merchant ID
                        <input
                          type="text"
                          value={form.config?.merchantId || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'merchantId', e.target.value)}
                          placeholder="PayU merchant key"
                        />
                      </label>
                      <label>
                        Salt
                        <input
                          type="text"
                          value={form.config?.salt || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'salt', e.target.value)}
                          placeholder="PayU salt"
                        />
                      </label>
                      <label>
                        Payment URL (optional)
                        <input
                          type="text"
                          value={form.config?.paymentUrl || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'paymentUrl', e.target.value)}
                          placeholder="https://test.payu.in/_payment"
                        />
                      </label>
                      <label>
                        Success URL
                        <input
                          type="text"
                          value={form.config?.successUrl || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'successUrl', e.target.value)}
                          placeholder="https://yourapp.com/payment-success"
                        />
                      </label>
                      <label>
                        Failure URL
                        <input
                          type="text"
                          value={form.config?.failureUrl || ''}
                          onChange={(e) => onGatewayConfigChange(g.gateway, 'failureUrl', e.target.value)}
                          placeholder="https://yourapp.com/payment-failure"
                        />
                      </label>
                    </>
                  )}

                  <div className="gateway-actions">
                    <button
                      className="btn-sm btn-success"
                      onClick={() => saveGateway(g.gateway)}
                      disabled={savingGateway === g.gateway}
                    >
                      {savingGateway === g.gateway ? 'Saving...' : 'Save Config'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="page-header" style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1a1a2e' }}>Payment Orders</h2>
        <span className="badge">{total} total</span>
      </div>

      <div className="filters">
        <select value={filters.gateway} onChange={(e) => { setFilters({ ...filters, gateway: e.target.value }); setPage(1); }}>
          <option value="">All Gateways</option>
          <option value="razorpay">Razorpay</option>
          <option value="payu">PayU</option>
        </select>
        <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
          <option value="">All Status</option>
          <option value="created">Created</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Search by order id, user, provider id"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ minWidth: 260, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #ddd' }}
        />
        <button className="btn-sm" onClick={loadOrders}>Refresh</button>
      </div>

      {loadingOrders ? (
        <div className="loading">Loading payment orders...</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Gateway</th>
                  <th>Purpose</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Provider IDs</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {searchableOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty">No payment orders found</td>
                  </tr>
                ) : searchableOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      {order.User ? `${order.User.firstName || ''} ${order.User.lastName || ''}`.trim() : `User #${order.userId}`}
                      <div style={{ fontSize: '0.72rem', color: '#888' }}>{order.User?.email || ''}</div>
                    </td>
                    <td>
                      <span className={`payment-chip ${order.gateway}`}>{order.gateway}</span>
                    </td>
                    <td><span className="tag">{order.purpose}</span></td>
                    <td className="text-green">₹{order.amount}</td>
                    <td><span className={`status-dot ${order.status}`}>{order.status}</span></td>
                    <td className="truncate" title={`${order.providerOrderId || ''} ${order.providerPaymentId || ''} ${order.providerTxnId || ''}`}>
                      {order.providerOrderId || '-'}
                      <br />
                      <small>{order.providerPaymentId || order.providerTxnId || ''}</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="status-actions">
                        {(order.status === 'created' || order.status === 'pending') && (
                          <>
                            <button
                              className="btn-sm btn-success"
                              disabled={updatingOrderId === order.id}
                              onClick={() => updateOrderStatus(order.id, 'success')}
                            >
                              Success
                            </button>
                            <button
                              className="btn-sm btn-danger"
                              disabled={updatingOrderId === order.id}
                              onClick={() => updateOrderStatus(order.id, 'failed')}
                            >
                              Fail
                            </button>
                          </>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'success' && (
                          <button
                            className="btn-sm"
                            disabled={updatingOrderId === order.id}
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

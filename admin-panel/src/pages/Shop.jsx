import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Table.css';

const emptyProduct = {
  categoryId: '', name: '', description: '', shortDescription: '', price: '', compareAtPrice: '',
  sku: '', stock: 0, images: '', thumbnail: '', icon: '', tags: '', isActive: true, isFeatured: false,
};
const emptyCategory = { name: '', description: '', image: '', parentId: '', sortOrder: 0, isActive: true };

export default function Shop() {
  const [tab, setTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Categories lookup
  const [categories, setCategories] = useState([]);

  // Product modal
  const [showProd, setShowProd] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [prodForm, setProdForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  // Category modal
  const [showCat, setShowCat] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState(emptyCategory);

  useEffect(() => { setPage(1); }, [tab]);
  useEffect(() => { loadData(); }, [tab, page]);
  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try {
      const r = await api.get('/admin/shop/categories', { params: { page: 1, limit: 200 } });
      setCategories(r.data.data.categories || []);
    } catch { }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'products' ? '/admin/shop/products' : '/admin/shop/categories';
      const res = await api.get(endpoint, { params: { page, limit } });
      const d = res.data.data;
      setItems(d.products || d.categories || []);
      setTotal(d.total || 0);
    } catch {
      toast.error(`Failed to load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // ─── Product CRUD ───────────────────────

  const openAddProduct = () => { setEditProd(null); setProdForm(emptyProduct); setShowProd(true); };

  const openEditProduct = (p) => {
    setEditProd(p);
    setProdForm({
      categoryId: p.categoryId || '', name: p.name, description: p.description || '',
      shortDescription: p.shortDescription || '', price: p.price, compareAtPrice: p.compareAtPrice || '',
      sku: p.sku || '', stock: p.stock || 0, images: Array.isArray(p.images) ? p.images.join(', ') : '',
      thumbnail: p.thumbnail || '', icon: p.icon || '', tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      isActive: p.isActive, isFeatured: p.isFeatured,
    });
    setShowProd(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price || !prodForm.categoryId) return toast.error('Name, price and category are required');
    setSaving(true);
    try {
      const payload = {
        categoryId: parseInt(prodForm.categoryId),
        name: prodForm.name,
        description: prodForm.description,
        shortDescription: prodForm.shortDescription,
        price: parseFloat(prodForm.price),
        compareAtPrice: prodForm.compareAtPrice ? parseFloat(prodForm.compareAtPrice) : null,
        sku: prodForm.sku || null,
        stock: parseInt(prodForm.stock) || 0,
        images: prodForm.images ? prodForm.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        thumbnail: prodForm.thumbnail || null,
        icon: prodForm.icon || null,
        tags: prodForm.tags ? prodForm.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        isActive: prodForm.isActive,
        isFeatured: prodForm.isFeatured,
      };
      if (editProd) {
        await api.put(`/admin/shop/products/${editProd.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/admin/shop/products', payload);
        toast.success('Product created');
      }
      setShowProd(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/shop/products/${id}`);
      toast.success('Product deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ─── Category CRUD ──────────────────────

  const openAddCategory = () => { setEditCat(null); setCatForm(emptyCategory); setShowCat(true); };

  const openEditCategory = (c) => {
    setEditCat(c);
    setCatForm({
      name: c.name, description: c.description || '', image: c.image || '',
      parentId: c.parentId || '', sortOrder: c.sortOrder || 0, isActive: c.isActive,
    });
    setShowCat(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name) return toast.error('Category name is required');
    setSaving(true);
    try {
      const payload = {
        name: catForm.name,
        description: catForm.description,
        image: catForm.image || null,
        parentId: catForm.parentId ? parseInt(catForm.parentId) : null,
        sortOrder: parseInt(catForm.sortOrder) || 0,
        isActive: catForm.isActive,
      };
      if (editCat) {
        await api.put(`/admin/shop/categories/${editCat.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/shop/categories', payload);
        toast.success('Category created');
      }
      setShowCat(false);
      loadData();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/shop/categories/${id}`);
      toast.success('Category deleted');
      loadData();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ─── Render ─────────────────────────────

  return (
    <div className="table-page">
      <div className="page-header">
        <h1 className="page-title">Shop Management</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="badge">{total} total</span>
          {tab === 'products' && <button className="btn-sm btn-primary" onClick={openAddProduct}>+ Add Product</button>}
          {tab === 'categories' && <button className="btn-sm btn-primary" onClick={openAddCategory}>+ Add Category</button>}
        </div>
      </div>

      <div className="tabs">
        {['products', 'categories'].map((t) => (
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
                  {tab === 'products' && <><th>ID</th><th>Icon</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Featured</th><th>Active</th><th>Actions</th></>}
                  {tab === 'categories' && <><th>ID</th><th>Name</th><th>Slug</th><th>Parent</th><th>Sort</th><th>Active</th><th>Actions</th></>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {tab === 'products' && (
                      <>
                        <td>{item.id}</td>
                        <td style={{ fontSize: 20 }}>{item.icon || '📦'}</td>
                        <td><strong>{item.name}</strong>{item.sku && <small style={{ display: 'block', color: '#888' }}>SKU: {item.sku}</small>}</td>
                        <td>
                          ₹{item.price}
                          {item.compareAtPrice > 0 && <small style={{ display: 'block', color: '#999', textDecoration: 'line-through' }}>₹{item.compareAtPrice}</small>}
                        </td>
                        <td>{item.stock}</td>
                        <td>{item.Category?.name || '—'}</td>
                        <td>{item.isFeatured ? '⭐' : '—'}</td>
                        <td>{item.isActive ? '✅' : '❌'}</td>
                        <td>
                          <button className="btn-sm" onClick={() => openEditProduct(item)}>Edit</button>{' '}
                          <button className="btn-sm btn-danger" onClick={() => deleteProduct(item.id)}>Delete</button>
                        </td>
                      </>
                    )}
                    {tab === 'categories' && (
                      <>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong></td>
                        <td style={{ color: '#888' }}>{item.slug}</td>
                        <td>{categories.find(c => c.id === item.parentId)?.name || '—'}</td>
                        <td>{item.sortOrder}</td>
                        <td>{item.isActive ? '✅' : '❌'}</td>
                        <td>
                          <button className="btn-sm" onClick={() => openEditCategory(item)}>Edit</button>{' '}
                          <button className="btn-sm btn-danger" onClick={() => deleteCategory(item.id)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="9" className="empty">No {tab} found</td></tr>
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

      {/* ─── Product Modal ─────────────────── */}
      {showProd && (
        <div className="modal-overlay" onClick={() => setShowProd(false)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <h2>{editProd ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={saveProduct}>
              <div className="form-grid-2">
                <label>
                  Name *
                  <input value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} required />
                </label>
                <label>
                  Category *
                  <select value={prodForm.categoryId} onChange={e => setProdForm({ ...prodForm, categoryId: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  Price (₹) *
                  <input type="number" step="0.01" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} required />
                </label>
                <label>
                  Compare-at Price
                  <input type="number" step="0.01" value={prodForm.compareAtPrice} onChange={e => setProdForm({ ...prodForm, compareAtPrice: e.target.value })} />
                </label>
                <label>
                  SKU
                  <input value={prodForm.sku} onChange={e => setProdForm({ ...prodForm, sku: e.target.value })} />
                </label>
                <label>
                  Stock
                  <input type="number" value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} />
                </label>
                <label>
                  Icon (emoji)
                  <input value={prodForm.icon} onChange={e => setProdForm({ ...prodForm, icon: e.target.value })} placeholder="💎" />
                </label>
                <label>
                  Thumbnail URL
                  <input value={prodForm.thumbnail} onChange={e => setProdForm({ ...prodForm, thumbnail: e.target.value })} />
                </label>
              </div>
              <label>
                Short Description
                <input value={prodForm.shortDescription} onChange={e => setProdForm({ ...prodForm, shortDescription: e.target.value })} />
              </label>
              <label>
                Description
                <textarea rows={3} value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} />
              </label>
              <label>
                Image URLs (comma-separated)
                <input value={prodForm.images} onChange={e => setProdForm({ ...prodForm, images: e.target.value })} placeholder="https://..., https://..." />
              </label>
              <label>
                Tags (comma-separated)
                <input value={prodForm.tags} onChange={e => setProdForm({ ...prodForm, tags: e.target.value })} placeholder="premium, new, sale" />
              </label>
              <div style={{ display: 'flex', gap: 16, margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={prodForm.isActive} onChange={e => setProdForm({ ...prodForm, isActive: e.target.checked })} /> Active
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={prodForm.isFeatured} onChange={e => setProdForm({ ...prodForm, isFeatured: e.target.checked })} /> Featured ⭐
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-sm" onClick={() => setShowProd(false)}>Cancel</button>
                <button type="submit" className="btn-sm btn-primary" disabled={saving}>{saving ? 'Saving...' : editProd ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Category Modal ────────────────── */}
      {showCat && (
        <div className="modal-overlay" onClick={() => setShowCat(false)}>
          <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h2>{editCat ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={saveCategory}>
              <label>
                Name *
                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
              </label>
              <label>
                Description
                <textarea rows={2} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
              </label>
              <label>
                Image URL
                <input value={catForm.image} onChange={e => setCatForm({ ...catForm, image: e.target.value })} />
              </label>
              <div className="form-grid-2">
                <label>
                  Parent Category
                  <select value={catForm.parentId} onChange={e => setCatForm({ ...catForm, parentId: e.target.value })}>
                    <option value="">None (Top-Level)</option>
                    {categories.filter(c => !editCat || c.id !== editCat.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label>
                  Sort Order
                  <input type="number" value={catForm.sortOrder} onChange={e => setCatForm({ ...catForm, sortOrder: e.target.value })} />
                </label>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0' }}>
                <input type="checkbox" checked={catForm.isActive} onChange={e => setCatForm({ ...catForm, isActive: e.target.checked })} /> Active
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-sm" onClick={() => setShowCat(false)}>Cancel</button>
                <button type="submit" className="btn-sm btn-primary" disabled={saving}>{saving ? 'Saving...' : editCat ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

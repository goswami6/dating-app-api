import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlineShoppingBag,
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineWallet,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCreditCard,
  HiOutlineTrophy,
  HiOutlineTruck,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import './Layout.css';

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
      { to: '/users', icon: HiOutlineUsers, label: 'Users' },
    ],
  },
  {
    title: 'Engagement',
    items: [
      { to: '/matches', icon: HiOutlineHeart, label: 'Matches' },
      { to: '/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
      { to: '/calls', icon: HiOutlinePhone, label: 'Calls' },
      { to: '/bookings', icon: HiOutlineCalendar, label: 'Bookings' },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { to: '/shop', icon: HiOutlineShoppingBag, label: 'Shop' },
      { to: '/product-orders', icon: HiOutlineTruck, label: 'Product Orders' },
      { to: '/wallet', icon: HiOutlineWallet, label: 'Wallet' },
      { to: '/payments', icon: HiOutlineCreditCard, label: 'Payments' },
      { to: '/subscriptions', icon: HiOutlineCreditCard, label: 'Subscriptions' },
      { to: '/badges', icon: HiOutlineTrophy, label: 'Badges' },
    ],
  },
];

const pageTitles = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/matches': 'Matches',
  '/messages': 'Messages',
  '/calls': 'Calls',
  '/bookings': 'Bookings',
  '/shop': 'Shop',
  '/product-orders': 'Product Orders',
  '/wallet': 'Wallet',
  '/payments': 'Payments',
  '/subscriptions': 'Subscriptions',
  '/badges': 'Badges',
};

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentTitle = pageTitles[location.pathname] || 'Dashboard';
  const initials = `${(admin?.firstName || 'A')[0]}${(admin?.lastName || '')[0] || ''}`.toUpperCase();

  return (
    <div className={`layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-card">
            <div className="admin-avatar">{initials}</div>
            <div className="admin-info">
              <span className="admin-name">{admin?.firstName || 'Admin'}</span>
              <span className="admin-email">{admin?.email}</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <HiOutlineXMark />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              <span className="nav-section-title">{section.title}</span>
              {section.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  title={label}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <HiOutlineArrowRightOnRectangle />
            <span className="nav-label">Logout</span>
          </button>
        </div>

        <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <HiOutlineBars3 />
          </button>
          <h2 className="topbar-title">{currentTitle}</h2>
          <div className="topbar-right">
            <div className="topbar-admin">
              <div className="topbar-avatar">{initials}</div>
              <span className="topbar-name">{admin?.firstName || 'Admin'}</span>
            </div>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

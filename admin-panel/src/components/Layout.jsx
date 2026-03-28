import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'react-icons/hi2';
import './Layout.css';

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/users', icon: HiOutlineUsers, label: 'Users' },
  { to: '/matches', icon: HiOutlineHeart, label: 'Matches' },
  { to: '/bookings', icon: HiOutlineCalendar, label: 'Bookings' },
  { to: '/calls', icon: HiOutlinePhone, label: 'Calls' },
  { to: '/messages', icon: HiOutlineChatBubbleLeftRight, label: 'Messages' },
  { to: '/shop', icon: HiOutlineShoppingBag, label: 'Shop' },
  { to: '/wallet', icon: HiOutlineWallet, label: 'Wallet' },
];

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="logo">💘 Admin</span>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <HiOutlineXMark />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info">
            <span className="admin-name">{admin?.firstName || 'Admin'}</span>
            <span className="admin-email">{admin?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <HiOutlineBars3 />
          </button>
          <h2 className="topbar-title">Dating App Admin</h2>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

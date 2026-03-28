import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  HiOutlineUsers,
  HiOutlineHeart,
  HiOutlineCalendar,
  HiOutlinePhone,
  HiOutlineShoppingBag,
  HiOutlineCreditCard,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, matches, bookings, calls, orders, subscriptions, badges] = await Promise.all([
        api.get('/admin/stats/users').catch(() => ({ data: { data: { total: 0, active: 0, premium: 0, online: 0 } } })),
        api.get('/admin/stats/matches').catch(() => ({ data: { data: { total: 0, mutual: 0 } } })),
        api.get('/admin/stats/bookings').catch(() => ({ data: { data: { total: 0, pending: 0, accepted: 0 } } })),
        api.get('/admin/stats/calls').catch(() => ({ data: { data: { total: 0, ongoing: 0 } } })),
        api.get('/admin/stats/orders').catch(() => ({ data: { data: { total: 0, revenue: 0 } } })),
        api.get('/admin/stats/subscriptions').catch(() => ({ data: { data: { totalPlans: 0, activePlans: 0, totalSubscribers: 0, activeSubscribers: 0 } } })),
        api.get('/admin/stats/badges').catch(() => ({ data: { data: { totalBadges: 0, totalAwarded: 0, premiumBadges: 0 } } })),
      ]);

      setStats({
        users: users.data.data,
        matches: matches.data.data,
        bookings: bookings.data.data,
        calls: calls.data.data,
        orders: orders.data.data,
        subscriptions: subscriptions.data.data,
        badges: badges.data.data,
      });
    } catch {
      // Stats will show 0s
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { icon: HiOutlineUsers, label: 'Total Users', value: stats?.users?.total || 0, sub: `${stats?.users?.active || 0} active · ${stats?.users?.online || 0} online`, color: '#6c5ce7' },
    { icon: HiOutlineUsers, label: 'Premium Users', value: stats?.users?.premium || 0, sub: 'subscribed', color: '#e84393' },
    { icon: HiOutlineCreditCard, label: 'Subscription Plans', value: stats?.subscriptions?.totalPlans || 0, sub: `${stats?.subscriptions?.activeSubscribers || 0} active subscribers`, color: '#a29bfe' },
    { icon: HiOutlineHeart, label: 'Total Matches', value: stats?.matches?.total || 0, sub: `${stats?.matches?.mutual || 0} mutual`, color: '#e17055' },
    { icon: HiOutlineCalendar, label: 'Bookings', value: stats?.bookings?.total || 0, sub: `${stats?.bookings?.pending || 0} pending`, color: '#00b894' },
    { icon: HiOutlinePhone, label: 'Calls', value: stats?.calls?.total || 0, sub: `${stats?.calls?.ongoing || 0} ongoing`, color: '#0984e3' },
    { icon: HiOutlineShoppingBag, label: 'Orders', value: stats?.orders?.total || 0, sub: `₹${stats?.orders?.revenue || 0} revenue`, color: '#fdcb6e' },
    { icon: HiOutlineTrophy, label: 'Badges', value: stats?.badges?.totalBadges || 0, sub: `${stats?.badges?.totalAwarded || 0} awarded · ${stats?.badges?.premiumBadges || 0} premium`, color: '#fd79a8' },
  ];

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: card.color + '18', color: card.color }}>
              <card.icon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
              <span className="stat-sub">{card.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

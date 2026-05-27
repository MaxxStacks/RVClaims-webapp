// client/src/layouts/SupplierLayout.tsx — Supplier Portal Layout

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import ds360Icon from '@assets/ds360_favicon.png';
import type { Language } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useQuery } from '@tanstack/react-query';

interface Props { children?: React.ReactNode; }

export default function SupplierLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { language: lang, setLanguage, t } = useLanguage();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.role !== 'supplier') {
      setLocation('/dev-access-v7');
    }
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    apiFetch<any>('/api/notifications/inbox')
      .then(d => setNotifItems(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: supplierData } = useQuery({
    queryKey: ['supplierMe'],
    queryFn: () => apiFetch<any>('/api/suppliers/me'),
    enabled: user?.role === 'supplier',
    retry: false,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['supplierMeOrders'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/orders'),
    enabled: user?.role === 'supplier',
    retry: false,
  });

  const supplier = supplierData?.supplier;
  const pendingOrderCount = (ordersData?.orders ?? []).filter((o: any) => o.status === 'pending').length;

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const handleSetLang = (l: string) => setLanguage(l as Language);
  const isActive = (path: string) => location === path || location.startsWith(path + '/');

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await apiFetch<any>('/api/notifications/inbox');
      setNotifItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch { setNotifItems([]); } finally { setNotifLoading(false); }
  };

  const toggleNotif = () => { if (!notifOpen) loadNotifications(); setNotifOpen(o => !o); };
  const unreadCount = notifItems.filter(n => !n.isRead).length;

  const verificationBadge = supplier?.verificationStatus === 'verified'
    ? { label: 'Verified', color: '#16a34a', bg: '#dcfce7' }
    : supplier?.verificationStatus === 'rejected'
      ? { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' }
      : supplier?.verificationStatus === 'suspended'
        ? { label: 'Suspended', color: '#d97706', bg: '#fef3c7' }
        : { label: 'Pending Review', color: '#d97706', bg: '#fef3c7' };

  const navItems = [
    { path: '/supplier/dashboard', icon: '⊞', label: t('supplier.title') || 'Dashboard' },
    { path: '/supplier/orders', icon: '📦', label: t('supplier.orders') || 'Orders', badge: pendingOrderCount },
    { path: '/supplier/catalog', icon: '◫', label: t('supplier.catalog') || 'Catalog' },
    { path: '/supplier/dealers', icon: '◇', label: t('supplier.dealers') || 'Connected Dealers' },
    { path: '/supplier/payments', icon: '◈', label: 'Payments' },
    { path: '/supplier/settings', icon: '⚙', label: t('nav.settings') || 'Settings' },
  ];

  const sidebarW = sidebarCollapsed ? 56 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg, #f8fafc)', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarW, minWidth: sidebarW, background: '#fff',
        borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s', overflow: 'hidden', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
      }}>
        {/* Logo / Brand */}
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #e2e8f0', minHeight: 60 }}>
          <img src={ds360Icon} alt="DS360" style={{ width: 28, height: 28, flexShrink: 0 }} />
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#033280', lineHeight: 1.2, whiteSpace: 'nowrap' }}>DS360</div>
              <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap' }}>Supplier Portal</div>
            </div>
          )}
        </div>

        {/* Supplier Info */}
        {!sidebarCollapsed && supplier && (
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {supplier.companyName}
            </div>
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10,
              background: verificationBadge.bg, color: verificationBadge.color,
            }}>
              {verificationBadge.label}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} href={item.path}>
                <a style={{
                  display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 10,
                  padding: sidebarCollapsed ? '10px 14px' : '9px 12px',
                  borderRadius: 7, marginBottom: 2, textDecoration: 'none',
                  background: active ? '#eff6ff' : 'transparent',
                  color: active ? '#033280' : '#475569',
                  fontWeight: active ? 600 : 400, fontSize: 13,
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  {!sidebarCollapsed && item.badge != null && item.badge > 0 && (
                    <span style={{
                      marginLeft: 'auto', background: '#0cb22c', color: '#fff',
                      fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                    }}>{item.badge}</span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => logout()}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px',
              background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer',
              color: '#64748b', fontSize: 13, fontWeight: 400, justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <span>↩</span>
            {!sidebarCollapsed && <span>{t('common.signOut') || 'Sign Out'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, marginLeft: sidebarW, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s' }}>

        {/* AppBar */}
        <header style={{
          height: 56, background: '#033280', display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Collapse toggle */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 18, padding: '4px 6px', borderRadius: 4 }}
            title="Toggle sidebar"
          >☰</button>

          {/* Company name */}
          <div style={{ flex: 1, color: '#e2e8f0', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {supplier?.companyName || 'Supplier Portal'}
            {supplier?.verificationStatus === 'verified' && (
              <span style={{ marginLeft: 8, fontSize: 11, background: '#16a34a', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>Verified</span>
            )}
            {supplier?.verificationStatus === 'pending' && (
              <span style={{ marginLeft: 8, fontSize: 11, background: '#d97706', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>Pending Verification</span>
            )}
          </div>

          {/* Lang toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', fontSize: 12 }}>
            {(['en', 'fr'] as Language[]).map(l => (
              <button key={l} onClick={() => handleSetLang(l)} style={{
                padding: '4px 10px', border: 'none', cursor: 'pointer', fontWeight: lang === l ? 700 : 400,
                background: lang === l ? '#fff' : 'transparent', color: lang === l ? '#033280' : '#cbd5e1',
                transition: 'all 0.15s',
              }}>{l.toUpperCase()}</button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#cbd5e1', borderRadius: 6, padding: '5px 9px', fontSize: 14 }}
            title="Toggle theme"
          >{theme === 'dark' ? '☀' : '☾'}</button>

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={toggleNotif}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#cbd5e1', borderRadius: 6, padding: '5px 9px', fontSize: 16, position: 'relative' }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff',
                  fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {notifOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '110%', width: 320, background: '#fff',
                border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                  Notifications
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifLoading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading…</div>
                  ) : notifItems.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No notifications yet</div>
                  ) : notifItems.slice(0, 10).map((n: any) => (
                    <div key={n.id} style={{
                      padding: '10px 16px', borderBottom: '1px solid #f8fafc',
                      background: n.isRead ? '#fff' : '#f0f9ff',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: '#1e293b', marginBottom: 2 }}>{n.title}</div>
                      {n.message && <div style={{ fontSize: 12, color: '#64748b' }}>{n.message}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '0' }}>
          {children}
        </main>
      </div>

      <MobileBottomNav
        portalType="dealer"
        activePage={location.split('/').filter(Boolean)[1] || 'dashboard'}
        onNavigate={(pageId) => setLocation(`/supplier/${pageId}`)}
      />
    </div>
  );
}

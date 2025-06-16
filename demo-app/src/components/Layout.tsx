import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home', testId: 'nav-home' },
    { href: '/dashboard', label: 'Dashboard', testId: 'nav-dashboard' },
    { href: '/analytics', label: 'Analytics', testId: 'nav-analytics' },
    { href: '/users', label: 'User Management', testId: 'nav-users' },
    { href: '/settings', label: 'Settings', testId: 'nav-settings' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Demo App</h2>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
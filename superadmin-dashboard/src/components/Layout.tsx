import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'All Users', href: '/users' },
    { name: 'All Businesses', href: '/businesses' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--gray-100)' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '256px', 
        backgroundColor: 'white', 
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: 'var(--gray-900)'
          }}>
            SuperAdmin
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: 'var(--gray-600)'
          }}>
            Global Dashboard
          </p>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <div 
                key={item.name}
                style={{
                  position: 'relative',
                  backgroundColor: isActive ? 'var(--primary-100)' : 'transparent'
                }}
              >
                <Link
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--primary-900)' : 'var(--gray-700)',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      const target = e.target as HTMLElement;
                      const parent = target.parentElement as HTMLElement;
                      parent.style.backgroundColor = 'var(--gray-100)';
                      target.style.color = 'var(--gray-900)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      const target = e.target as HTMLElement;
                      const parent = target.parentElement as HTMLElement;
                      parent.style.backgroundColor = 'transparent';
                      target.style.color = 'var(--gray-700)';
                    }
                  }}
                >
                  {item.name}
                </Link>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: 'var(--primary-500)'
                  }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div style={{ 
          padding: '24px',
          borderTop: '1px solid var(--gray-200)',
          backgroundColor: 'var(--gray-50)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--primary-600)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {user?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '14px',
                color: 'var(--gray-900)',
                marginBottom: '2px'
              }}>
                {user?.name || 'Super Admin'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'var(--gray-600)'
              }}>
                {user?.role || 'superadmin'}
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: 'var(--gray-100)',
              border: '1px solid var(--gray-200)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--gray-700)',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--gray-200)';
              target.style.color = 'var(--gray-900)';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'var(--gray-100)';
              target.style.color = 'var(--gray-700)';
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ 
        flex: 1, 
        padding: '24px',
        backgroundColor: 'var(--gray-100)',
        overflow: 'auto'
      }}>
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Plus,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'All Users', href: '/users', icon: Users },
  { name: 'All Businesses', href: '/businesses', icon: Building2 },
  { name: 'Create Business', href: '/create-business', icon: Plus },
  { name: 'Admin CSV', href: '/admin-csv', icon: FileText },
  { name: 'User Analytics', href: '/analytics', icon: BarChart3 },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-neutral-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary-800 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-card shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-border">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-text-on-primary" />
            </div>
            <span className="ml-3 text-lg font-semibold text-text-primary">SuperAdmin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-accent-50 text-accent-700 border-r-2 border-accent'
                    : 'text-text-secondary hover:bg-neutral-surface hover:text-text-primary'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-accent' : 'text-text-light'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User info and logout at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-border bg-neutral-card">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-700" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text-primary">{user?.name || 'Super Admin'}</p>
              <p className="text-xs text-text-secondary">{user?.role || 'superadmin'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-text-secondary hover:bg-neutral-surface hover:text-text-primary rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-neutral-card shadow-sm border-b border-neutral-border lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-secondary hover:text-text-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">
              {navigation.find(item => item.href === location.pathname)?.name || 'SuperAdmin'}
            </h1>
            <div></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
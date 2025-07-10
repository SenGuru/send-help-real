import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BusinessPage from './pages/BusinessPage';
import ThemePage from './pages/ThemePage';
import RankingsPage from './pages/RankingsPage';
import CouponsPage from './pages/CouponsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import PointTiersPage from './pages/PointTiersPage';
import PointsManagementPage from './pages/PointsManagementPage';
import ManageUsersPage from './pages/ManageUsersPage';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="business" element={<BusinessPage />} />
        <Route path="theme" element={<ThemePage />} />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="point-tiers" element={<PointTiersPage />} />
        <Route path="points" element={<PointsManagementPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="menu" element={<MenuManagementPage />} />
        <Route path="users" element={<ManageUsersPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
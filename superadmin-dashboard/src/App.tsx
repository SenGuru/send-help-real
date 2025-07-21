import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AllUsers from './pages/AllUsers';
import AllBusinesses from './pages/AllBusinesses';
import UserAnalytics from './pages/UserAnalytics';
import CreateBusiness from './pages/CreateBusiness';
import AdminCSV from './pages/AdminCSV';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <AllUsers />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/businesses" element={
              <ProtectedRoute>
                <Layout>
                  <AllBusinesses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <UserAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/create-business" element={
              <ProtectedRoute>
                <Layout>
                  <CreateBusiness />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin-csv" element={
              <ProtectedRoute>
                <Layout>
                  <AdminCSV />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

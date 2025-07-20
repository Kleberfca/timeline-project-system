// src/App.tsx
/**
 * Componente principal da aplicação
 * Define rotas e estrutura geral
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout/Layout';

// Páginas públicas
import { Login } from './pages/Login';

// Páginas do administrador
import { AdminDashboard } from './pages/admin/Dashboard';
import { ClientesList } from './pages/admin/ClientesList';
import { ClienteForm } from './pages/admin/ClienteForm';
import { ProjetosList } from './pages/admin/ProjetosList';
import { ProjetoForm } from './pages/admin/ProjetoForm';
import { ProjetoDetails } from './pages/admin/ProjetoDetails';

// Páginas do cliente
import { ProjetosCliente } from './pages/cliente/ProjetosCliente';
import { ProjetoDetailsCliente } from './pages/cliente/ProjetoDetailsCliente';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas do administrador */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requireAdmin>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <PrivateRoute requireAdmin>
                  <ClientesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/clientes/novo"
              element={
                <PrivateRoute requireAdmin>
                  <ClienteForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/clientes/:id"
              element={
                <PrivateRoute requireAdmin>
                  <ClienteForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/projetos"
              element={
                <PrivateRoute requireAdmin>
                  <ProjetosList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/projetos/novo"
              element={
                <PrivateRoute requireAdmin>
                  <ProjetoForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/projetos/:id"
              element={
                <PrivateRoute requireAdmin>
                  <ProjetoDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/projetos/:id/editar"
              element={
                <PrivateRoute requireAdmin>
                  <ProjetoForm />
                </PrivateRoute>
              }
            />

            {/* Rotas do cliente */}
            <Route
              path="/cliente/projetos"
              element={
                <PrivateRoute>
                  <ProjetosCliente />
                </PrivateRoute>
              }
            />
            <Route
              path="/cliente/projetos/:id"
              element={
                <PrivateRoute>
                  <ProjetoDetailsCliente />
                </PrivateRoute>
              }
            />

            {/* Redirecionamentos */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/cliente" element={<Navigate to="/cliente/projetos" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;

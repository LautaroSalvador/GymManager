import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { PageLoading } from '../components/ui/PageLoading';

// Cada página se descarga recién cuando se visita. Así la librería de
// gráficos (Recharts, lo más pesado) solo se baja al entrar a Reportes.
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ClientesPage = lazy(() =>
  import('../pages/ClientesPage').then((m) => ({ default: m.ClientesPage }))
);
const ClienteDetallePage = lazy(() =>
  import('../pages/ClienteDetallePage').then((m) => ({ default: m.ClienteDetallePage }))
);
const ReportesPage = lazy(() =>
  import('../pages/ReportesPage').then((m) => ({ default: m.ReportesPage }))
);
const ConfiguracionPage = lazy(() =>
  import('../pages/ConfiguracionPage').then((m) => ({ default: m.ConfiguracionPage }))
);

/** Muestra un spinner mientras se descarga el código de la página. */
const withSuspense = (page: React.ReactNode) => (
  <Suspense fallback={<PageLoading message="Cargando..." />}>{page}</Suspense>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={withSuspense(<DashboardPage />)} />
            <Route path="/clientes" element={withSuspense(<ClientesPage />)} />
            <Route path="/clientes/:id" element={withSuspense(<ClienteDetallePage />)} />
            <Route path="/reportes" element={withSuspense(<ReportesPage />)} />
            <Route path="/configuracion" element={withSuspense(<ConfiguracionPage />)} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Inicio', icon: <LayoutDashboard size={18} /> },
    { to: '/clientes', label: 'Clientes', icon: <Users size={18} /> },
    { to: '/reportes', label: 'Reportes', icon: <BarChart3 size={18} /> },
    { to: '/configuracion', label: 'Ajustes', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900 font-sans">

      {/* ── Sidebar Desktop ─────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-neutral-200 shrink-0">

        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-100">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img src="/logo.png" alt="Gym O2 Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-neutral-900 leading-none tracking-tight">
              Gym O2
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">Panel de control</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold shrink-0 uppercase">
              {user?.username?.[0] ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-800 truncate capitalize">
                {user?.username}
              </p>
              <p className="text-xs text-neutral-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger w-full text-sm py-2"
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">

        {/* Top header — mobile only */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-neutral-200 sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="Gym O2 Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-neutral-900 tracking-tight">Gym O2</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom nav — Mobile ──────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 z-40 flex items-center justify-around px-2 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`
            }
          >
            <div>{item.icon}</div>
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

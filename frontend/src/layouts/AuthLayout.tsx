import React from 'react';
import { Outlet } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-12 font-sans">
      {/* Subtle decorative gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-100/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo above card */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-200 mb-3">
            <Dumbbell size={30} />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            GymManager
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sistema de gestión para tu gimnasio
          </p>
        </div>

        {/* Card wrapper */}
        <div className="card p-8">
          <Outlet />
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} GymManager — Gestión de gimnasio
        </p>
      </div>
    </div>
  );
};

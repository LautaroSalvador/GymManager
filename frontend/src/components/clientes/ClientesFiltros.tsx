import React from 'react';
import { Search } from 'lucide-react';

export type FiltroClientes = 'activos' | 'inactivos' | 'todos' | 'con_deuda';

const FILTER_TABS: { key: FiltroClientes; label: string }[] = [
  { key: 'activos',   label: 'Activos' },
  { key: 'con_deuda', label: 'Con deuda' },
  { key: 'inactivos', label: 'Inactivos' },
  { key: 'todos',     label: 'Todos' },
];

interface ClientesFiltrosProps {
  filter: FiltroClientes;
  onFilterChange: (filter: FiltroClientes) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export const ClientesFiltros: React.FC<ClientesFiltrosProps> = ({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-5">
    {/* Filter tabs */}
    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 shrink-0">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
            filter === tab.key
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>

    {/* Search */}
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
        <Search size={16} />
      </div>
      <input
        id="clientes-search"
        type="text"
        placeholder="Buscar por nombre, DNI o teléfono..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="input-base pl-9"
      />
    </div>
  </div>
);

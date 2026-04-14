import React from 'react';
import type { ClientsTab } from '@/features/clients/types';

interface ClientsHeaderProps {
  activeTab: ClientsTab;
  onTabChange: (tab: ClientsTab) => void;
  onCreateClient: () => void;
}

const tabs: ClientsTab[] = ['Todos', 'Socios', 'No Socios'];

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ activeTab, onTabChange, onCreateClient }) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <nav className="flex gap-8 border-b border-border/80">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`pb-3 px-1 border-b-2 text-sm transition-colors ${
                isActive
                  ? 'border-gold text-gold font-bold'
                  : 'border-transparent text-text2 font-medium hover:text-gold'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-semibold text-text2 hover:bg-hover transition-colors"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          Filtros Avanzados
        </button>
        <button
          type="button"
          onClick={onCreateClient}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-white rounded-md text-sm font-bold shadow-sm hover:bg-gold-d transition-colors"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Nuevo Cliente
        </button>
      </div>
    </div>
  );
};

export default ClientsHeader;

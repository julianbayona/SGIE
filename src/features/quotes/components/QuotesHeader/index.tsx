import React from 'react';
import type { QuotesTab } from '@/features/quotes/types';

interface QuotesHeaderProps {
  activeTab: QuotesTab;
  onTabChange: (tab: QuotesTab) => void;
}

const tabs: QuotesTab[] = ['Recientes', 'Pendientes', 'Aprobadas'];

const QuotesHeader: React.FC<QuotesHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-display text-4xl italic font-light text-on-surface">Listado de Cotizaciones</h1>
          <p className="text-sm text-stone-500 mt-2 font-medium tracking-wide uppercase">
            Historico Maestro de Ventas y Servicios
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-stone-600 text-sm font-semibold rounded flex items-center gap-2 hover:bg-stone-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filtros Avanzados
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-stone-600 text-sm font-semibold rounded flex items-center gap-2 hover:bg-stone-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Exportar Excel
          </button>
        </div>
      </div>

      <nav className="flex gap-6 border-b border-outline-variant/30">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-primary-gold font-bold border-b-2 border-primary-gold'
                  : 'text-stone-600 hover:text-primary-gold'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default QuotesHeader;

import React from 'react';

const EventsPageHeader: React.FC = () => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text3 mb-2">
          <span>Gestion</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-gold font-bold">Eventos</span>
        </nav>
        <h1 className="text-4xl font-display italic text-text1">Gestion de Eventos</h1>
      </div>

      <button
        type="button"
        className="flex items-center gap-2 bg-gradient-to-r from-gold-d to-gold text-white px-6 py-3 rounded-lg shadow-gold hover:brightness-110 active:scale-[0.98] transition-all font-bold text-sm"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        Nuevo Evento
      </button>
    </div>
  );
};

export default EventsPageHeader;

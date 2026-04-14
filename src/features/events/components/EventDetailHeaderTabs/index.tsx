import React from 'react';
import { Link } from 'react-router-dom';
import type { EventSummaryData } from '@/features/events/data/eventSummary';

export type EventDetailTab =
  | 'summary'
  | 'menu'
  | 'agenda'
  | 'montaje'
  | 'cotizacion'
  | 'pagos';

interface EventDetailHeaderTabsProps {
  event: EventSummaryData;
  activeTab: EventDetailTab;
}

const tabs: Array<{ key: EventDetailTab; label: string; getPath: (eventId: string) => string }> = [
  { key: 'summary', label: 'Resumen', getPath: (eventId) => `/events/${eventId}` },
  { key: 'menu', label: 'Menu', getPath: (eventId) => `/events/${eventId}/menu` },
  { key: 'agenda', label: 'Agenda', getPath: (eventId) => `/events/${eventId}/agenda` },
  { key: 'montaje', label: 'Montaje', getPath: (eventId) => `/events/${eventId}/montaje` },
  { key: 'cotizacion', label: 'Cotizacion', getPath: (eventId) => `/events/${eventId}/cotizacion` },
  { key: 'pagos', label: 'Pagos', getPath: (eventId) => `/events/${eventId}/pagos` },
];

const EventDetailHeaderTabs: React.FC<EventDetailHeaderTabsProps> = ({ event, activeTab }) => {
  return (
    <>
      <section className="mt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">{event.id}</span>
              <div className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pending_actions</span>
                {event.status}
              </div>
            </div>
            <h2 className="text-5xl lg:text-6xl font-display font-bold text-on-surface mb-4">{event.title.replace(' - ', ' · ')}</h2>
            <div className="flex items-center gap-6 text-on-surface-variant font-medium text-lg flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">calendar_today</span>
                {event.dateLabel}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">schedule</span>
                {event.timeLabel}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-xl">public</span>
              Enlace publico
            </button>
            <button
              type="button"
              className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
              Editar
            </button>
            <button
              type="button"
              className="bg-error-container text-on-error-container px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:bg-red-100 transition-all"
            >
              <span className="material-symbols-outlined text-xl">cancel</span>
              Cancelar
            </button>
          </div>
        </div>
      </section>

      <nav className="flex gap-8 border-b border-outline-variant/30 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <Link
              key={tab.key}
              to={tab.getPath(event.id)}
              className={`pb-4 px-1 whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-primary-gold font-semibold border-b-2 border-primary-gold'
                  : 'text-gray-500 font-medium hover:text-primary-gold'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default EventDetailHeaderTabs;

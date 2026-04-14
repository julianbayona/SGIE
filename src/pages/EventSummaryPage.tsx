import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventSummaryById } from '@/features/events/data/eventSummary';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';

const EventSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const event = useMemo(() => {
    return getEventSummaryById(eventId);
  }, [eventId]);

  return (
    <section className="space-y-10 pb-28">
      <EventDetailHeaderTabs event={event} activeTab="summary" />

      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-px bg-outline-variant/30 flex-1"></div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Detalles de la Reserva</span>
          <div className="h-px bg-outline-variant/30 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 shadow-sm border border-surface-container">
            <div className="bg-secondary-container/50 w-12 h-12 flex items-center justify-center rounded-lg text-primary-gold">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Cliente Principal</span>
              <p className="text-xl font-display font-bold mt-1">{event.customerName}</p>
              <p className="text-sm text-on-surface-variant mt-1">{event.customerPhone}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 shadow-sm border border-surface-container">
            <div className="bg-secondary-container/50 w-12 h-12 flex items-center justify-center rounded-lg text-primary-gold">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Tipo de Evento</span>
              <p className="text-xl font-display font-bold mt-1">{event.eventType}</p>
              <p className="text-sm text-on-surface-variant mt-1">{event.guests} Invitados</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 shadow-sm border border-surface-container">
            <div className="bg-secondary-container/50 w-12 h-12 flex items-center justify-center rounded-lg text-primary-gold">
              <span className="material-symbols-outlined">meeting_room</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Espacio Reservado</span>
              <p className="text-xl font-display font-bold mt-1">{event.venue}</p>
              <p className="text-sm text-on-surface-variant mt-1">{event.venueCapacity}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col gap-4 shadow-sm border border-surface-container">
            <div className="bg-secondary-container/50 w-12 h-12 flex items-center justify-center rounded-lg text-primary-gold">
              <span className="material-symbols-outlined">monetization_on</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider">Total Cotizado</span>
              <p className="text-xl font-display font-bold mt-1">{event.totalQuote}</p>
              <p className="text-sm text-on-surface-variant mt-1">Iva incluido (19%)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-outline-variant/30 flex-1"></div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Estado del Proceso</span>
          <div className="h-px bg-outline-variant/30 flex-1"></div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-surface-container">
          <div className="relative flex justify-between items-start max-w-5xl mx-auto">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-surface-container-high -z-0"></div>
            {['Pendiente', 'Esp. menu', 'Cotiz. enviada', 'Cotiz. aprobada', 'Pend. anticipo', 'Confirmado'].map((step, index) => {
              const isCurrent = step === 'Pend. anticipo';
              const isDone = index < 4;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center text-center w-28">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                      isCurrent
                        ? 'bg-white border-4 border-primary-gold text-primary-gold ring-8 ring-primary-gold/20'
                        : isDone
                          ? 'bg-primary-gold text-white'
                          : 'bg-surface-container-high text-outline'
                    }`}
                  >
                    {isDone ? <span className="material-symbols-outlined text-lg">check</span> : null}
                    {isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-primary-gold"></div> : null}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-tighter ${isCurrent ? 'text-primary-gold' : 'text-on-surface-variant'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 right-10 z-30 flex items-center gap-4">
        <div className="bg-surface-container-lowest/90 backdrop-blur-md px-6 py-4 rounded-full border border-primary-gold/20 shadow-xl hidden md:flex items-center gap-3">
          <span className="text-primary-gold font-bold">Resumen de cuenta:</span>
          <span className="text-on-surface-variant font-medium">Faltan {event.totalQuote}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="bg-primary-gold text-white font-display font-bold px-10 py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 ring-4 ring-white/20"
        >
          <span className="material-symbols-outlined text-2xl">payments</span>
          <span className="text-lg">Registrar Anticipo</span>
        </button>
      </div>
    </section>
  );
};

export default EventSummaryPage;

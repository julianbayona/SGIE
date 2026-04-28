import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventSummaryById } from '@/features/events/data/eventSummary';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';

const lifecycleSteps = [
  'Pendiente',
  'Esperando selección de menú',
  'Cotización enviada',
  'Cotización aprobada',
  'Pendiente anticipo',
  'Confirmado',
];

const EventSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const event = useMemo(() => {
    return getEventSummaryById(eventId);
  }, [eventId]);

  const currentStepIndex = lifecycleSteps.indexOf(event.status);

  return (
    <section className="space-y-8 pb-28">
      <EventDetailHeaderTabs event={event} activeTab="summary" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-border">
          <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Cliente principal</span>
          <p className="text-lg font-display font-bold mt-2">{event.customerName}</p>
          <p className="text-sm text-on-surface-variant mt-1">{event.customerPhone}</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-border">
          <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Tipo de evento</span>
          <p className="text-lg font-display font-bold mt-2">{event.eventType}</p>
          <p className="text-sm text-on-surface-variant mt-1">{event.guests} invitados</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-border">
          <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Salón reservado</span>
          <p className="text-lg font-display font-bold mt-2">{event.venue}</p>
          <p className="text-sm text-on-surface-variant mt-1">{event.venueCapacity}</p>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-border">
          <span className="text-xs text-stone-500 uppercase tracking-wider font-bold">Total cotizado</span>
          <p className="text-lg font-display font-bold mt-2">{event.totalQuote}</p>
          <p className="text-sm text-on-surface-variant mt-1">IVA incluido si aplica</p>
        </div>
      </div>

      <section className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h3 className="text-lg font-display font-bold text-on-surface">Estado del proceso</h3>
            <p className="text-sm text-on-surface-variant mt-1">Transiciones automáticas según acciones del usuario.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/events/${event.id}/pagos`)}
            className="bg-primary-gold text-white font-bold px-4 py-2.5 rounded-md shadow-sm hover:bg-primary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">payments</span>
            Registrar anticipo
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="relative flex justify-between items-start min-w-[760px]">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-0"></div>
            {lifecycleSteps.map((step, index) => {
              const isCurrent = index === currentStepIndex;
              const isDone = currentStepIndex > index;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center text-center w-32">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border ${
                      isCurrent
                        ? 'bg-white border-primary-gold text-primary-gold ring-4 ring-primary-gold/15'
                        : isDone
                          ? 'bg-primary-gold border-primary-gold text-white'
                          : 'bg-surface-container-low border-border text-text3'
                    }`}
                  >
                    {isDone ? <span className="material-symbols-outlined text-lg">check</span> : null}
                    {isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-primary-gold"></div> : null}
                  </div>
                  <span className={`text-[11px] font-bold leading-tight ${isCurrent ? 'text-primary-gold' : 'text-on-surface-variant'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
};

export default EventSummaryPage;

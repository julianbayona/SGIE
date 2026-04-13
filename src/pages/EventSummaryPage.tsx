import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface EventSummaryData {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  status: 'Pendiente anticipo' | 'Confirmado' | 'Cotizacion Enviada';
  customerName: string;
  customerPhone: string;
  eventType: string;
  guests: number;
  venue: string;
  venueCapacity: string;
  totalQuote: string;
}

const summaryById: Record<string, EventSummaryData> = {
  'EVT-041': {
    id: 'EVT-041',
    title: 'Boda · Carlos Ruiz',
    dateLabel: '24 de Agosto, 2024',
    timeLabel: '18:00 - 02:00',
    status: 'Pendiente anticipo',
    customerName: 'Carlos Ruiz Hernandez',
    customerPhone: '301 456 7890',
    eventType: 'Boda / Social',
    guests: 120,
    venue: 'Gran Salon Imperial',
    venueCapacity: 'Capacidad: 150 pax',
    totalQuote: '$12.450.000',
  },
  'EV-2409': {
    id: 'EV-2409',
    title: 'Evento · Ana Maria Rojas',
    dateLabel: '14 de Octubre, 2024',
    timeLabel: '18:00 - 22:00',
    status: 'Confirmado',
    customerName: 'Ana Maria Rojas',
    customerPhone: '312 456 7890',
    eventType: 'Social',
    guests: 80,
    venue: 'Salon Jade',
    venueCapacity: 'Capacidad: 100 pax',
    totalQuote: '$8.250.000',
  },
  'EV-2410': {
    id: 'EV-2410',
    title: 'Evento · Juan Camilo Daza',
    dateLabel: '18 de Octubre, 2024',
    timeLabel: '19:00 - 01:00',
    status: 'Pendiente anticipo',
    customerName: 'Juan Camilo Daza',
    customerPhone: '300 123 4455',
    eventType: 'Boda',
    guests: 120,
    venue: 'Versalles Principal',
    venueCapacity: 'Capacidad: 150 pax',
    totalQuote: '$12.450.000',
  },
};

const EventSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const event = useMemo(() => {
    const normalizedId = eventId?.toUpperCase() ?? 'EVT-041';

    return (
      summaryById[normalizedId] ?? {
        id: normalizedId,
        title: `Evento · ${normalizedId}`,
        dateLabel: 'Por confirmar',
        timeLabel: 'Por confirmar',
        status: 'Cotizacion Enviada',
        customerName: 'Cliente por confirmar',
        customerPhone: 'Sin telefono',
        eventType: 'Sin definir',
        guests: 0,
        venue: 'Sin salon asignado',
        venueCapacity: 'Capacidad por confirmar',
        totalQuote: '$0',
      }
    );
  }, [eventId]);

  return (
    <section className="space-y-10 pb-28">
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
            <h2 className="text-5xl lg:text-6xl font-display font-bold text-on-surface mb-4">{event.title}</h2>
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
        <button className="text-primary-gold font-semibold border-b-2 border-primary-gold pb-4 px-1 whitespace-nowrap">Resumen</button>
        <button className="text-gray-500 font-medium hover:text-primary-gold transition-colors pb-4 px-1 whitespace-nowrap">Menu</button>
        <button className="text-gray-500 font-medium hover:text-primary-gold transition-colors pb-4 px-1 whitespace-nowrap">Montaje</button>
        <button className="text-gray-500 font-medium hover:text-primary-gold transition-colors pb-4 px-1 whitespace-nowrap">Cotizacion</button>
        <button className="text-gray-500 font-medium hover:text-primary-gold transition-colors pb-4 px-1 whitespace-nowrap">Pagos</button>
        <button className="text-gray-500 font-medium hover:text-primary-gold transition-colors pb-4 px-1 whitespace-nowrap">Historial</button>
      </nav>

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

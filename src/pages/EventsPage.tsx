import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsPageHeader from '@/features/events/components/EventsPageHeader';
import EventsToolbar from '@/features/events/components/EventsToolbar';
import EventsTable from '@/features/events/components/EventsTable';
import EventsTablePagination from '@/features/events/components/EventsTablePagination';
import type { EventRecord, EventStatus, EventsTab } from '@/features/events/types';
import eventosApi from '@/api/eventos';
import type { EventoResponse, EstadoEvento } from '@/api/types';

const estadoMap: Record<EstadoEvento, EventStatus> = {
  PENDIENTE: 'Pendiente',
  COTIZACION_ENVIADA: 'Cotización enviada',
  COTIZACION_APROBADA: 'Cotización aprobada',
  PENDIENTE_ANTICIPO: 'Pendiente anticipo',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
};

const nextActionMap: Record<EstadoEvento, string> = {
  PENDIENTE: 'Seleccionar menú y montaje',
  COTIZACION_ENVIADA: 'Esperar aprobación',
  COTIZACION_APROBADA: 'Registrar anticipo',
  PENDIENTE_ANTICIPO: 'Registrar anticipo',
  CONFIRMADO: 'Coordinar personal',
  CANCELADO: 'Sin acciones pendientes',
};

function toEventRecord(e: EventoResponse): EventRecord {
  const reservaVigente = e.reservas.find((r) => r.vigente);
  const inicio = new Date(e.fechaHoraInicio);
  const dateLabel = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(inicio);

  return {
    id: e.id.slice(0, 8).toUpperCase(),
    dateLabel,
    clientName: e.clienteId, // se enriquece con datos del cliente si se necesita
    clientDocument: `ID: ${e.clienteId.slice(0, 8)}`,
    clientInitials: '??',
    hall: reservaVigente?.salonId ?? 'Sin salón',
    eventKind: 'Social', // el tipo real viene del catálogo; se puede enriquecer
    status: estadoMap[e.estado] ?? 'Pendiente',
    isActive: e.estado !== 'CANCELADO',
    nextAction: nextActionMap[e.estado] ?? '',
  };
}

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EventsTab>('Todos');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventosApi.listar();
        if (!cancelled) setEvents(data.map(toEventRecord));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar eventos.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleEvents = useMemo(() => {
    if (activeTab === 'Activos') return events.filter((e) => e.isActive && e.status !== 'Cancelado');
    if (activeTab === 'Pendientes')
      return events.filter((e) =>
        ['Pendiente', 'Esperando selección de menú', 'Cotización enviada', 'Cotización aprobada', 'Pendiente anticipo'].includes(e.status)
      );
    if (activeTab === 'Confirmados') return events.filter((e) => e.status === 'Confirmado');
    if (activeTab === 'Cancelados') return events.filter((e) => e.status === 'Cancelado');
    return events;
  }, [activeTab, events]);

  return (
    <section className="space-y-6">
      <EventsPageHeader />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-lg shadow-sm overflow-hidden border border-border">
        <EventsToolbar activeTab={activeTab} onTabChange={setActiveTab} />
        {loading ? (
          <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">
            Cargando eventos…
          </div>
        ) : (
          <EventsTable
            events={visibleEvents}
            onViewEvent={(eventId) => navigate(`/events/${eventId}`)}
          />
        )}
        <EventsTablePagination from={1} to={visibleEvents.length} total={events.length} />
      </div>
    </section>
  );
};

export default EventsPage;

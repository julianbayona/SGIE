import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventsPageHeader from '@/features/events/components/EventsPageHeader';
import EventsToolbar from '@/features/events/components/EventsToolbar';
import EventsTable from '@/features/events/components/EventsTable';
import EventsTablePagination from '@/features/events/components/EventsTablePagination';
import type { EventRecord, EventsTab } from '@/features/events/types';

const eventsData: EventRecord[] = [
  {
    id: 'EV-2409',
    dateLabel: '14 Oct, 2024 · 2:00 p.m.',
    clientName: 'Ana María Rojas',
    clientDocument: 'CC. 1.052.485.xxx',
    clientInitials: 'AM',
    hall: 'Salón Jade',
    eventKind: 'Boda',
    status: 'Confirmado',
    isActive: true,
    nextAction: 'Coordinar personal',
  },
  {
    id: 'EV-2410',
    dateLabel: '18 Oct, 2024 · 7:00 p.m.',
    clientName: 'Juan Camilo Daza',
    clientDocument: 'CC. 80.231.xxx',
    clientInitials: 'JC',
    hall: 'Versalles Principal',
    eventKind: 'Cumpleaños',
    status: 'Pendiente anticipo',
    isActive: true,
    nextAction: 'Registrar anticipo',
  },
  {
    id: 'EV-2411',
    dateLabel: '22 Oct, 2024 · 12:30 p.m.',
    clientName: 'Constructora Capital',
    clientDocument: 'NIT. 900.564.xxx',
    clientInitials: 'CC',
    hall: 'Múltiples salones',
    eventKind: 'Corporativo',
    status: 'Cotización enviada',
    isActive: true,
    nextAction: 'Esperar aprobación',
  },
  {
    id: 'EV-2412',
    dateLabel: '25 Oct, 2024 · 9:00 a.m.',
    clientName: 'Lucía Ramírez',
    clientDocument: 'CC. 46.382.xxx',
    clientInitials: 'LR',
    hall: 'Terraza Mirador',
    eventKind: 'Bautizo',
    status: 'Esperando selección de menú',
    isActive: true,
    nextAction: 'Enviar propuesta de menú',
  },
  {
    id: 'EV-2413',
    dateLabel: '28 Oct, 2024 · 4:00 p.m.',
    clientName: 'Familia Mendoza',
    clientDocument: 'CC. 79.567.xxx',
    clientInitials: 'FM',
    hall: 'Biblioteca',
    eventKind: 'Social',
    status: 'Cancelado',
    isActive: false,
    nextAction: 'Sin acciones pendientes',
  },
];

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EventsTab>('Todos');

  const visibleEvents = useMemo(() => {
    if (activeTab === 'Activos') {
      return eventsData.filter((event) => event.isActive && event.status !== 'Cancelado');
    }

    if (activeTab === 'Pendientes') {
      return eventsData.filter((event) =>
        ['Pendiente', 'Esperando selección de menú', 'Cotización enviada', 'Cotización aprobada', 'Pendiente anticipo'].includes(event.status)
      );
    }

    if (activeTab === 'Confirmados') {
      return eventsData.filter((event) => event.status === 'Confirmado');
    }

    if (activeTab === 'Cancelados') {
      return eventsData.filter((event) => event.status === 'Cancelado');
    }

    return eventsData;
  }, [activeTab]);

  return (
    <section className="space-y-6">
      <EventsPageHeader />

      <div className="bg-surface rounded-lg shadow-sm overflow-hidden border border-border">
        <EventsToolbar activeTab={activeTab} onTabChange={setActiveTab} />
        <EventsTable events={visibleEvents} onViewEvent={(eventId) => navigate(`/events/${eventId}`)} />
        <EventsTablePagination from={1} to={visibleEvents.length} total={eventsData.length} />
      </div>
    </section>
  );
};

export default EventsPage;

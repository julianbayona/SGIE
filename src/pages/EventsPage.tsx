import React, { useMemo, useState } from 'react';
import EventsPageHeader from '@/features/events/components/EventsPageHeader';
import EventsToolbar from '@/features/events/components/EventsToolbar';
import EventsTable from '@/features/events/components/EventsTable';
import EventsTablePagination from '@/features/events/components/EventsTablePagination';
import type { EventRecord, EventsTab } from '@/features/events/types';

const eventsData: EventRecord[] = [
  {
    id: 'EV-2409',
    dateLabel: '14 Oct, 2024',
    clientName: 'Ana Maria Rojas',
    clientDocument: 'CC. 1.052.485.xxx',
    clientInitials: 'AM',
    hall: 'Salon Jade',
    eventKind: 'Social',
    status: 'Confirmado',
    isActive: false,
  },
  {
    id: 'EV-2410',
    dateLabel: '18 Oct, 2024',
    clientName: 'Juan Camilo Daza',
    clientDocument: 'CC. 80.231.xxx',
    clientInitials: 'JC',
    hall: 'Versalles Principal',
    eventKind: 'Boda',
    status: 'Pendiente Anticipo',
    isActive: true,
  },
  {
    id: 'EV-2411',
    dateLabel: '22 Oct, 2024',
    clientName: 'Constructora Capital',
    clientDocument: 'NIT. 900.564.xxx',
    clientInitials: 'CC',
    hall: 'Multiple',
    eventKind: 'Corporativo',
    status: 'Cotizacion Enviada',
    isActive: true,
  },
  {
    id: 'EV-2412',
    dateLabel: '25 Oct, 2024',
    clientName: 'Lucia Ramirez',
    clientDocument: 'CC. 46.382.xxx',
    clientInitials: 'LR',
    hall: 'Terraza Mirador',
    eventKind: 'Social',
    status: 'Confirmado',
    isActive: false,
  },
];

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EventsTab>('Historial');

  const visibleEvents = useMemo(() => {
    if (activeTab === 'Activos') {
      return eventsData.filter((event) => event.isActive);
    }

    return eventsData;
  }, [activeTab]);

  return (
    <section className="space-y-6">
      <EventsPageHeader />

      <div className="bg-surface rounded-xl shadow-sm overflow-hidden border border-border">
        <EventsToolbar activeTab={activeTab} onTabChange={setActiveTab} />
        <EventsTable events={visibleEvents} />
        <EventsTablePagination from={1} to={visibleEvents.length} total={128} />
      </div>
    </section>
  );
};

export default EventsPage;

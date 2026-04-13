import React from 'react';
import EventTableRow from '@/features/events/components/EventTableRow';
import type { EventRecord } from '@/features/events/types';

interface EventsTableProps {
  events: EventRecord[];
}

const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-stone-50/70">
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3">ID / Fecha</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3">Cliente</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3">Salon</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3">Tipo de Evento</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3">Estado</th>
            <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-text3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-stone-100">
          {events.map((event) => (
            <EventTableRow key={event.id} event={event} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;

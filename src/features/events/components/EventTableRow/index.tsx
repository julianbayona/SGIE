import React from 'react';
import type { EventRecord } from '@/features/events/types';

interface EventTableRowProps {
  event: EventRecord;
  onViewEvent: (eventId: string) => void;
}

const statusClasses: Record<EventRecord['status'], string> = {
  Confirmado: 'text-green-text',
  'Pendiente Anticipo': 'text-red-text',
  'Cotizacion Enviada': 'text-gold',
};

const statusDotClasses: Record<EventRecord['status'], string> = {
  Confirmado: 'bg-green',
  'Pendiente Anticipo': 'bg-red',
  'Cotizacion Enviada': 'bg-gold',
};

const EventTableRow: React.FC<EventTableRowProps> = ({ event, onViewEvent }) => {
  return (
    <tr className="hover:bg-surface transition-colors">
      <td className="px-6 py-5">
        <p className="font-bold text-text1 text-sm">#{event.id}</p>
        <p className="text-xs text-text3">{event.dateLabel}</p>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-panel flex items-center justify-center text-gold font-bold text-xs uppercase">
            {event.clientInitials}
          </div>
          <div>
            <p className="font-bold text-text1 text-sm">{event.clientName}</p>
            <p className="text-xs text-text3">{event.clientDocument}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-sm font-medium text-text1">{event.hall}</td>

      <td className="px-6 py-5">
        <span className="px-2 py-1 bg-panel text-text2 rounded text-[10px] font-bold uppercase tracking-wider">
          {event.eventKind}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusDotClasses[event.status]}`}></span>
          <span className={`text-xs font-bold ${statusClasses[event.status]}`}>{event.status}</span>
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onViewEvent(event.id)}
            className="p-1.5 hover:bg-panel rounded text-text3 hover:text-gold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-panel rounded text-text3 hover:text-gold transition-colors"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-panel rounded text-text3 hover:text-green transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EventTableRow;

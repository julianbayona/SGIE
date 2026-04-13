import React from 'react';
import { Event, EventStatus } from '../../types';

const statusStyles: Record<EventStatus, { bg: string; border: string; text: string; }> = {
    'Confirmado': { bg: 'bg-agenda-green/10', border: 'border-agenda-green', text: 'text-agenda-green' },
    'Pendiente': { bg: 'bg-agenda-red/10', border: 'border-agenda-red', text: 'text-agenda-red' },
    'Cotización enviada': { bg: 'bg-primary-gold/10', border: 'border-primary-gold', text: 'text-primary-gold' },
    'Cotización aprobada': { bg: 'bg-primary-gold/10', border: 'border-primary-gold', text: 'text-primary-gold' },
    'Pendiente anticipo': { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-500' },
    'Esperando selección de menú': { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500' },
    'Cancelado': { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-500' },
};


interface EventItemProps {
  event: Event;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const style = statusStyles[event.status] || statusStyles['Pendiente'];

  return (
    <div className={`flex items-center gap-1 ${style.bg} px-1 py-0.5 rounded text-[7px] font-bold ${style.text} truncate`}>
      <span className={`w-1 h-1 rounded-full ${style.bg.replace('/10', '')}`}></span>
      {event.title}
    </div>
  );
};

export default EventItem;

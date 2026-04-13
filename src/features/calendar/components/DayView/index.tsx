import React from 'react';
import { format, getHours } from 'date-fns';
import { useCalendarStore } from '@/store/calendarStore';
import { useCalendar } from '../../hooks/useCalendar';
import { Event } from '../../types';

const statusStyles: Record<Event['status'], { bg: string; border: string; text: string; }> = {
    'Confirmado': { bg: 'bg-agenda-green/10', border: 'border-agenda-green', text: 'text-agenda-green' },
    'Pendiente': { bg: 'bg-agenda-red/10', border: 'border-agenda-red', text: 'text-agenda-red' },
    'Cotización enviada': { bg: 'bg-primary-gold/10', border: 'border-primary-gold', text: 'text-primary-gold' },
    'Cotización aprobada': { bg: 'bg-primary-gold/10', border: 'border-primary-gold', text: 'text-primary-gold' },
    'Pendiente anticipo': { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-500' },
    'Esperando selección de menú': { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-500' },
    'Cancelado': { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-500' },
};

const DayView: React.FC = () => {
  const { selectedDate } = useCalendarStore();
  const { events, loading } = useCalendar();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number): Event[] => {
    return events.filter(event => getHours(event.start) === hour);
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '80px 1fr' }}>
      {loading ? (
        <div className="col-span-2 p-4 text-center">Cargando eventos...</div>
      ) : (
        hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="calendar-cell p-4 text-[11px] font-bold text-stone-400 text-right pr-6 bg-stone-50/30">
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
            <div className="calendar-cell bg-white relative p-2 min-h-[64px]">
              {getEventsForHour(hour).map(event => {
                const style = statusStyles[event.status];
                return (
                  <div key={event.id} className={`absolute inset-x-4 inset-y-2 rounded ${style.bg} ${style.border} border-l-4 p-3 shadow-sm group cursor-pointer hover:bg-opacity-20 transition-all`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-on-surface mb-1">{event.title}</p>
                        <p className={`text-[10px] ${style.text} font-medium flex items-center gap-1`}>
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {event.salon}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-stone-400 uppercase">
                        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default DayView;

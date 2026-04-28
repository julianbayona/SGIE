import type { EventStatus } from '@/features/events/types';

export interface EventSummaryData {
  id: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  status: EventStatus;
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
    title: 'Boda - Carlos Ruiz',
    dateLabel: '24 de Agosto, 2024',
    timeLabel: '18:00 - 02:00',
    status: 'Pendiente anticipo',
    customerName: 'Carlos Ruiz Hernández',
    customerPhone: '301 456 7890',
    eventType: 'Boda / Social',
    guests: 120,
    venue: 'Gran Salón Imperial',
    venueCapacity: 'Capacidad: 150 pax',
    totalQuote: '$12.450.000',
  },
  'EV-2409': {
    id: 'EV-2409',
    title: 'Evento - Ana María Rojas',
    dateLabel: '14 de Octubre, 2024',
    timeLabel: '18:00 - 22:00',
    status: 'Confirmado',
    customerName: 'Ana María Rojas',
    customerPhone: '312 456 7890',
    eventType: 'Social',
    guests: 80,
    venue: 'Salón Jade',
    venueCapacity: 'Capacidad: 100 pax',
    totalQuote: '$8.250.000',
  },
  'EV-2410': {
    id: 'EV-2410',
    title: 'Evento - Juan Camilo Daza',
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

export const getEventSummaryById = (eventId?: string): EventSummaryData => {
  const normalizedId = eventId?.toUpperCase() ?? 'EVT-041';

  return (
    summaryById[normalizedId] ?? {
      id: normalizedId,
      title: `Evento - ${normalizedId}`,
      dateLabel: 'Por confirmar',
      timeLabel: 'Por confirmar',
      status: 'Cotización enviada',
      customerName: 'Cliente por confirmar',
      customerPhone: 'Sin teléfono',
      eventType: 'Sin definir',
      guests: 0,
      venue: 'Sin salón asignado',
      venueCapacity: 'Capacidad por confirmar',
      totalQuote: '$0',
    }
  );
};

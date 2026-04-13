export type EventStatus = 'Confirmado' | 'Pendiente Anticipo' | 'Cotizacion Enviada';
export type EventKind = 'Social' | 'Boda' | 'Corporativo';
export type EventsTab = 'Historial' | 'Activos';

export interface EventRecord {
  id: string;
  dateLabel: string;
  clientName: string;
  clientDocument: string;
  clientInitials: string;
  hall: string;
  eventKind: EventKind;
  status: EventStatus;
  isActive: boolean;
}

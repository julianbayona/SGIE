export type QuoteStatus = 'Aceptada' | 'Enviada' | 'Borrador' | 'Desactualizada' | 'Rechazada';
export type QuoteCustomerType = 'Socio' | 'No Socio';
export type QuotesTab = 'Recientes' | 'Pendientes' | 'Aprobadas';

export interface QuoteRecord {
  id: string;
  eventName: string;
  eventMeta: string;
  customerName: string;
  customerType: QuoteCustomerType;
  createdAt: string;
  totalValue: string;
  status: QuoteStatus;
}

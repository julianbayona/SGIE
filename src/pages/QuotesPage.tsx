import React, { useMemo, useState } from 'react';
import QuotesHeader from '@/features/quotes/components/QuotesHeader';
import QuotesTable from '@/features/quotes/components/QuotesTable';
import QuotesTablePagination from '@/features/quotes/components/QuotesTablePagination';
import type { QuoteRecord, QuotesTab } from '@/features/quotes/types';

const quotesData: QuoteRecord[] = [
  {
    id: 'COT-8422',
    eventName: 'Boda Alicia Morales',
    eventMeta: 'Salón Principal · 200 invitados',
    customerName: 'Alicia Morales',
    customerType: 'Socio',
    createdAt: '12 Oct 2023',
    totalValue: '$ 14.500.000',
    status: 'Aceptada',
  },
  {
    id: 'COT-8421',
    eventName: 'Cena Corporativa Bancolombia',
    eventMeta: 'Terraza Club · 50 invitados',
    customerName: 'Roberto Vélez',
    customerType: 'No Socio',
    createdAt: '10 Oct 2023',
    totalValue: '$ 3.200.000',
    status: 'Enviada',
  },
  {
    id: 'COT-8420',
    eventName: 'Aniversario Familia Pineda',
    eventMeta: 'Salón VIP · 15 invitados',
    customerName: 'Juan Pineda',
    customerType: 'Socio',
    createdAt: '08 Oct 2023',
    totalValue: '$ 1.850.000',
    status: 'Borrador',
  },
  {
    id: 'COT-8419',
    eventName: 'Graduación Colegio Mayor',
    eventMeta: 'Salón Imperial · 400 invitados',
    customerName: 'Secretaría Académica',
    customerType: 'No Socio',
    createdAt: '01 Oct 2023',
    totalValue: '$ 28.900.000',
    status: 'Desactualizada',
  },
  {
    id: 'COT-8418',
    eventName: 'Despedida de Año IBM',
    eventMeta: 'Área Social · 120 invitados',
    customerName: 'Recursos Humanos',
    customerType: 'No Socio',
    createdAt: '25 Sep 2023',
    totalValue: '$ 9.450.000',
    status: 'Rechazada',
  },
];

const QuotesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<QuotesTab>('Recientes');

  const visibleQuotes = useMemo(() => {
    if (activeTab === 'Aprobadas') {
      return quotesData.filter((quote) => quote.status === 'Aceptada');
    }

    if (activeTab === 'Pendientes') {
      return quotesData.filter((quote) => quote.status === 'Enviada' || quote.status === 'Borrador' || quote.status === 'Desactualizada');
    }

    return quotesData;
  }, [activeTab]);

  return (
    <section className="space-y-6">
      <QuotesHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-surface rounded-lg overflow-hidden shadow-sm border border-border">
        <QuotesTable quotes={visibleQuotes} />
        <QuotesTablePagination from={1} to={visibleQuotes.length} total={156} />
      </div>
    </section>
  );
};

export default QuotesPage;

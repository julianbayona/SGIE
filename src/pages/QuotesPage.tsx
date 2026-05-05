import React, { useEffect, useMemo, useState } from 'react';
import QuotesHeader from '@/features/quotes/components/QuotesHeader';
import QuotesTable from '@/features/quotes/components/QuotesTable';
import QuotesTablePagination from '@/features/quotes/components/QuotesTablePagination';
import type { QuoteRecord, QuotesTab } from '@/features/quotes/types';

const QuotesPage: React.FC = () => {
  const [quotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<QuotesTab>('Recientes');

  useEffect(() => {
    setLoading(false);
  }, []);

  const visibleQuotes = useMemo(() => {
    if (activeTab === 'Aprobadas') return quotes.filter((q) => q.status === 'Aceptada');
    if (activeTab === 'Pendientes')
      return quotes.filter((q) =>
        ['Enviada', 'Borrador', 'Desactualizada'].includes(q.status)
      );
    return quotes;
  }, [activeTab, quotes]);

  return (
    <section className="space-y-6">
      <QuotesHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Las cotizaciones se gestionan desde el detalle de cada evento */}

      <div className="bg-surface rounded-lg overflow-hidden shadow-sm border border-border">        {loading ? (
          <div className="flex items-center justify-center py-16 text-on-surface-variant text-sm">
            Cargando cotizaciones…
          </div>
        ) : visibleQuotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant text-sm gap-2">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
            <p>Las cotizaciones se gestionan desde el detalle de cada evento.</p>
          </div>
        ) : (
          <QuotesTable quotes={visibleQuotes} />
        )}
        <QuotesTablePagination from={1} to={visibleQuotes.length} total={visibleQuotes.length} />
      </div>
    </section>
  );
};

export default QuotesPage;

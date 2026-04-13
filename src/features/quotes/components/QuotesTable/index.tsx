import React from 'react';
import QuoteTableRow from '@/features/quotes/components/QuoteTableRow';
import type { QuoteRecord } from '@/features/quotes/types';

interface QuotesTableProps {
  quotes: QuoteRecord[];
}

const QuotesTable: React.FC<QuotesTableProps> = ({ quotes }) => {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-stone-50 border-b border-stone-100">
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">ID</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Evento</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Creacion</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Valor Total</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estado</th>
          <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Acciones</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-stone-50">
        {quotes.map((quote) => (
          <QuoteTableRow key={quote.id} quote={quote} />
        ))}
      </tbody>
    </table>
  );
};

export default QuotesTable;

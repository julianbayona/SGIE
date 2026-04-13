import React from 'react';
import type { QuoteRecord } from '@/features/quotes/types';

interface QuoteTableRowProps {
  quote: QuoteRecord;
}

const statusClasses: Record<QuoteRecord['status'], string> = {
  Aceptada: 'bg-green-100 text-green-700',
  Enviada: 'bg-blue-100 text-blue-700',
  Borrador: 'bg-stone-200 text-stone-500',
  Desactualizada: 'bg-orange-100 text-orange-700',
  Rechazada: 'bg-red-100 text-red-700',
};

const QuoteTableRow: React.FC<QuoteTableRowProps> = ({ quote }) => {
  const isMember = quote.customerType === 'Socio';

  return (
    <tr className="hover:bg-stone-50/50 transition-colors">
      <td className="px-6 py-4 text-xs font-bold text-primary-gold">#{quote.id}</td>

      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-on-surface">{quote.eventName}</div>
        <div className="text-[10px] text-stone-400">{quote.eventMeta}</div>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-700">{quote.customerName}</span>
          <span
            className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-tighter ${
              isMember
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-stone-200 text-stone-600'
            }`}
          >
            {quote.customerType}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-sm text-stone-500 font-medium">{quote.createdAt}</td>
      <td className="px-6 py-4 text-sm font-bold text-on-surface">{quote.totalValue}</td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusClasses[quote.status]}`}
        >
          {quote.status}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-3 items-center text-stone-400">
          <button type="button" className="hover:text-green-600 transition-colors" title="WhatsApp">
            <span className="material-symbols-outlined text-lg">chat</span>
          </button>
          <button type="button" className="hover:text-error transition-colors" title="PDF">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
          </button>
          <button type="button" className="hover:text-primary-gold transition-colors" title="Editar">
            <span className="material-symbols-outlined text-lg">edit_square</span>
          </button>
          <button type="button" className="p-1 hover:bg-stone-200 rounded text-stone-600" title="Ver">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default QuoteTableRow;

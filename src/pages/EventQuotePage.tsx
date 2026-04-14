import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import { getEventSummaryById } from '@/features/events/data/eventSummary';

type PricingMode = 'servicio' | 'unidad';

interface QuoteItem {
  id: string;
  concept: string;
  pricingMode: PricingMode;
  quantity: number;
  unitBasePrice: number;
  unitOverridePrice: number;
  notes?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const EventQuotePage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>(() => {
    const guests = event.guests || 120;

    return [
      {
        id: 'venue',
        concept: 'Alquiler salon principal (4h)',
        pricingMode: 'servicio',
        quantity: 1,
        unitBasePrice: 1200000,
        unitOverridePrice: 1200000,
      },
      {
        id: 'menu-entrada',
        concept: 'Menu · Entrada',
        pricingMode: 'unidad',
        quantity: guests,
        unitBasePrice: 25000,
        unitOverridePrice: 25000,
        notes: 'Carpaccio de res con alcaparras',
      },
      {
        id: 'menu-consome',
        concept: 'Menu · Consome',
        pricingMode: 'unidad',
        quantity: guests,
        unitBasePrice: 8500,
        unitOverridePrice: 8500,
        notes: 'Crema de esparragos',
      },
      {
        id: 'menu-plato-fuerte',
        concept: 'Menu · Plato fuerte',
        pricingMode: 'unidad',
        quantity: guests,
        unitBasePrice: 65000,
        unitOverridePrice: 65000,
        notes: 'Medallon de lomo en salsa pimienta',
      },
      {
        id: 'menu-postre',
        concept: 'Menu · Postre',
        pricingMode: 'unidad',
        quantity: guests,
        unitBasePrice: 12000,
        unitOverridePrice: 12000,
        notes: 'Mousse de chocolate al 70%',
      },
      {
        id: 'menu-bebidas',
        concept: 'Menu · Bebidas',
        pricingMode: 'unidad',
        quantity: guests,
        unitBasePrice: 15000,
        unitOverridePrice: 15000,
        notes: 'Jugo natural + Agua',
      },
      {
        id: 'montage-base',
        concept: 'Montaje base y textiles',
        pricingMode: 'servicio',
        quantity: 1,
        unitBasePrice: 420000,
        unitOverridePrice: 420000,
      },
      {
        id: 'adicional-tarimas',
        concept: 'Adicional · Tarimas',
        pricingMode: 'unidad',
        quantity: 2,
        unitBasePrice: 180000,
        unitOverridePrice: 180000,
      },
      {
        id: 'adicional-audiovisuales',
        concept: 'Adicional · Audiovisuales',
        pricingMode: 'servicio',
        quantity: 1,
        unitBasePrice: 450000,
        unitOverridePrice: 450000,
      },
      {
        id: 'adicional-luces-arbol',
        concept: 'Adicional · Luces arbol',
        pricingMode: 'servicio',
        quantity: 1,
        unitBasePrice: 260000,
        unitOverridePrice: 260000,
      },
    ];
  });

  const [advancePercent, setAdvancePercent] = useState(20);
  const [quoteStatus, setQuoteStatus] = useState<'Borrador' | 'Enviada' | 'Aceptada'>('Aceptada');

  const history = [
    { id: 'COT-041-02', date: '10 jun 2025', status: 'Aceptada' },
    { id: 'COT-041-01', date: '2 jun 2025', status: 'Desactualizada' },
  ];

  const updateQuoteItem = (itemId: string, updater: (item: QuoteItem) => QuoteItem) => {
    setQuoteItems((prev) => prev.map((item) => (item.id === itemId ? updater(item) : item)));
  };

  const baseTotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + item.quantity * item.unitBasePrice, 0);
  }, [quoteItems]);

  const overrideTotal = useMemo(() => {
    return quoteItems.reduce((sum, item) => sum + item.quantity * item.unitOverridePrice, 0);
  }, [quoteItems]);

  const deltaTotal = overrideTotal - baseTotal;
  const advanceValue = Math.round((overrideTotal * advancePercent) / 100);
  const remainingValue = overrideTotal - advanceValue;

  const requestedMenuItems = useMemo(() => {
    return quoteItems.filter((item) => item.id.startsWith('menu-'));
  }, [quoteItems]);

  const requestedMontageAdditionalItems = useMemo(() => {
    return quoteItems.filter((item) => item.id.startsWith('adicional-'));
  }, [quoteItems]);

  return (
    <section className="space-y-8 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="cotizacion" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 space-y-6 mb-24">
          <div className="bg-surface-container-lowest border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/20 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Cotizacion activa</p>
                <h3 className="font-display text-2xl font-bold text-on-surface mt-1">#{event.id.replace('EVT', 'COT').replace('EV-', 'COT-')}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{event.title.replace(' - ', ' · ')} · {event.dateLabel}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  quoteStatus === 'Aceptada'
                    ? 'bg-green-bg text-green-text'
                    : quoteStatus === 'Enviada'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-surface-container-high text-on-surface'
                }`}
              >
                {quoteStatus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Concepto</th>
                    <th className="px-4 py-3">Cobro</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Precio base</th>
                    <th className="px-4 py-3 text-right">Precio override</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {quoteItems.map((item) => {
                    const hasOverride = item.unitOverridePrice !== item.unitBasePrice;

                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{item.concept}</p>
                          {item.notes ? <p className="text-xs text-on-surface-variant mt-1">{item.notes}</p> : null}
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {item.pricingMode === 'servicio' ? 'Por servicio' : 'Por unidad'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {item.pricingMode === 'unidad' ? (
                            <input
                              className="w-20 bg-surface-container-low border border-outline-variant/40 rounded-md px-2 py-1.5 text-sm text-right"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(eventTarget) => {
                                const next = Number(eventTarget.target.value);
                                updateQuoteItem(item.id, (prev) => ({
                                  ...prev,
                                  quantity: Math.max(1, Number.isNaN(next) ? 1 : next),
                                }));
                              }}
                            />
                          ) : (
                            <span className="text-sm text-on-surface-variant">1</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-on-surface-variant">
                          {formatCurrency(item.unitBasePrice)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <input
                            className={`w-28 bg-surface-container-low border rounded-md px-2 py-1.5 text-sm text-right ${
                              hasOverride ? 'border-primary-gold/60' : 'border-outline-variant/40'
                            }`}
                            type="number"
                            min={0}
                            step={1000}
                            value={item.unitOverridePrice}
                            onChange={(eventTarget) => {
                              const next = Number(eventTarget.target.value);
                              updateQuoteItem(item.id, (prev) => ({
                                ...prev,
                                unitOverridePrice: Math.max(0, Number.isNaN(next) ? 0 : next),
                              }));
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-on-surface">
                          {formatCurrency(item.quantity * item.unitOverridePrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-6 shadow-sm">
            <h4 className="font-display text-lg font-bold text-on-surface mb-4">Condiciones de pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-2">Anticipo (%)</label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                  type="number"
                  min={0}
                  max={100}
                  value={advancePercent}
                  onChange={(eventTarget) => {
                    const next = Number(eventTarget.target.value);
                    const normalized = Number.isNaN(next) ? 0 : next;
                    setAdvancePercent(Math.min(100, Math.max(0, normalized)));
                  }}
                />
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-700 mb-2">Anticipo requerido</p>
                <p className="text-xl font-display font-bold text-green-text">{formatCurrency(advanceValue)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-700 mb-2">Saldo restante</p>
                <p className="text-xl font-display font-bold text-on-surface">{formatCurrency(remainingValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:w-[330px] space-y-6 lg:sticky lg:top-[92px]">
          <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Resumen financiero</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total base</span>
                <span className="font-medium text-on-surface">{formatCurrency(baseTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total override</span>
                <span className="font-medium text-on-surface">{formatCurrency(overrideTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 pt-2">
                <span className="text-on-surface-variant">Ajuste neto</span>
                <span className={`font-semibold ${deltaTotal >= 0 ? 'text-primary-gold' : 'text-green-text'}`}>
                  {deltaTotal >= 0 ? '+' : '-'}{formatCurrency(Math.abs(deltaTotal))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Detalle solicitado</h4>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-bold text-neutral-500">Menu solicitado</p>
              {requestedMenuItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <p className="font-semibold text-on-surface">{item.concept.replace('Menu · ', '')}</p>
                  <p className="text-on-surface-variant text-xs">{item.notes ?? 'Sin detalle'} · {item.quantity} pax</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <p className="text-xs uppercase tracking-wider font-bold text-neutral-500">Adicionales de montaje</p>
              {requestedMontageAdditionalItems.map((item) => (
                <div key={item.id} className="text-sm flex items-center justify-between gap-3">
                  <p className="font-semibold text-on-surface">{item.concept.replace('Adicional · ', '')}</p>
                  <p className="text-on-surface-variant text-xs">
                    {item.pricingMode === 'unidad' ? `x${item.quantity}` : '1 servicio'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Historial cotizaciones</h4>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-on-surface">#{item.id}</p>
                    <p className="text-xs text-on-surface-variant">{item.date}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.status === 'Aceptada'
                        ? 'bg-green-bg text-green-text'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                className="w-full border border-outline-variant/50 hover:bg-surface-container-low transition-colors px-4 py-2.5 text-sm font-medium text-left"
              >
                Descargar PDF
              </button>
              <button
                type="button"
                className="w-full border border-green-text/40 text-green-text hover:bg-green-bg transition-colors px-4 py-2.5 text-sm font-medium text-left"
              >
                Reenviar por WhatsApp
              </button>
              <button
                type="button"
                className="w-full border border-outline-variant/50 hover:bg-surface-container-low transition-colors px-4 py-2.5 text-sm font-medium text-left"
              >
                Registrar ajuste manual
              </button>
            </div>
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-surface-container-lowest/80 backdrop-blur-md border-t border-surface-container px-6 py-4 flex justify-between items-center z-[60]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">La cotizacion se recalcula en tiempo real con cada ajuste</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-container-low transition-colors px-6 py-2.5 text-sm font-medium"
            type="button"
          >
            Marcar como enviada
          </button>
          <button
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary-gold text-white px-8 py-2.5 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
            type="button"
          >
            Guardar cotizacion
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventQuotePage;

import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import { getEventSummaryById } from '@/features/events/data/eventSummary';

interface PaymentRecord {
  id: string;
  date: string;
  concept: string;
  method: string;
  amount: number;
  registeredBy: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const parseCurrency = (value: string): number => {
  const onlyDigits = value.replace(/[^\d]/g, '');
  return Number(onlyDigits || 0);
};

const EventPaymentsPage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const totalEventAmount = event.id === 'EVT-041' ? 4230000 : parseCurrency(event.totalQuote);

  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay-001',
      date: '11 jun 2025',
      concept: 'Anticipo inicial',
      method: 'Transferencia',
      amount: 846000,
      registeredBy: 'P. Castro',
    },
  ]);

  const [newAmount, setNewAmount] = useState(0);
  const [newDate, setNewDate] = useState('');
  const [newMethod, setNewMethod] = useState('Transferencia');

  const paidAmount = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const pendingAmount = Math.max(totalEventAmount - paidAmount, 0);
  const paidProgress = totalEventAmount > 0 ? Math.min((paidAmount / totalEventAmount) * 100, 100) : 0;

  const registerPayment = () => {
    if (newAmount <= 0 || !newDate || pendingAmount <= 0) {
      return;
    }

    const safeAmount = Math.min(newAmount, pendingAmount);

    setPayments((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}`,
        date: new Date(newDate).toLocaleDateString('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        concept: 'Pago parcial',
        method: newMethod,
        amount: safeAmount,
        registeredBy: 'Usuario actual',
      },
    ]);

    setNewAmount(0);
    setNewDate('');
    setNewMethod('Transferencia');
  };

  return (
    <section className="space-y-10 pb-24">
      <EventDetailHeaderTabs event={event} activeTab="pagos" />

      <div className="bg-surface-container-lowest border border-border rounded-xl p-6 shadow-sm space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h3 className="text-3xl font-display font-bold text-on-surface">
            Pagos - {event.id} - {event.title.replace(' - ', ' · ')}
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-bg text-green-text">Aceptada</span>
        </div>

        <section className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 space-y-4">
          <p className="text-sm font-semibold text-on-surface">Anticipo pagado vs Total del evento</p>
          <div className="h-2.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className="h-full bg-green-700 rounded-full transition-all"
              style={{ width: `${paidProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm flex-wrap">
            <p className="font-semibold text-green-700">{formatCurrency(paidAmount)} pagados</p>
            <p className="text-on-surface-variant">
              Total: {formatCurrency(totalEventAmount)} - Saldo: {formatCurrency(pendingAmount)}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-2xl font-display font-bold text-on-surface">Registros de pago</h4>
          <div className="overflow-hidden rounded-lg border border-outline-variant/30">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Metodo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Registrado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-on-surface-variant">{payment.date}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{payment.concept}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{payment.method}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(payment.amount)}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{payment.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 border-t border-outline-variant/20 pt-6">
          <h4 className="text-2xl font-display font-bold text-on-surface">Registrar nuevo pago</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Valor</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                type="number"
                min={0}
                value={newAmount}
                onChange={(eventTarget) => setNewAmount(Math.max(0, Number(eventTarget.target.value) || 0))}
              />
              <p className="text-xs text-on-surface-variant mt-2">Max. {formatCurrency(pendingAmount)} (saldo pendiente)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Fecha de pago</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                type="date"
                value={newDate}
                onChange={(eventTarget) => setNewDate(eventTarget.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Metodo de pago</label>
              <select
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                value={newMethod}
                onChange={(eventTarget) => setNewMethod(eventTarget.target.value)}
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Nequi">Nequi</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="bg-[#191C1D] text-white px-6 py-3 rounded-md text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={newAmount <= 0 || !newDate || pendingAmount <= 0}
            onClick={registerPayment}
          >
            Registrar pago
          </button>
        </section>
      </div>
    </section>
  );
};

export default EventPaymentsPage;

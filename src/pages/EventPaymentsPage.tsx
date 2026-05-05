import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import eventosApi from '@/api/eventos';
import clientesApi from '@/api/clientes';
import salonesApi from '@/api/salones';
import catalogosApi from '@/api/catalogos';
import pagosApi from '@/api/pagos';
import type { EventoResponse, ClienteResponse, SalonResponse, CatalogoBasicoResponse } from '@/api/types';

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
  
  // Estados para datos del API
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [salon, setSalon] = useState<SalonResponse | null>(null);
  const [tipoEvento, setTipoEvento] = useState<CatalogoBasicoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalEventAmount = 0; // TODO: Obtener de cotización

  // Estado inicial vacío - sin datos hardcodeados
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const [newAmount, setNewAmount] = useState(0);
  const [newDate, setNewDate] = useState('');
  const [newMethod, setNewMethod] = useState('Transferencia');
  const [newConcept, setNewConcept] = useState('Anticipo');

  // Cargar evento al montar
  useEffect(() => {
    if (!eventId) return;
    
    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const eventoData = await eventosApi.obtenerPorId(eventId);
        if (cancelled) return;
        setEvento(eventoData);

        const reservaActual = eventoData.reservas.find(r => r.vigente);
        if (!reservaActual) {
          setError('No hay reserva activa para este evento');
          setLoading(false);
          return;
        }

        // Cargar datos relacionados en paralelo
        const [clienteData, tipoEventoData, salonData] = await Promise.all([
          clientesApi.obtenerPorId(eventoData.clienteId),
          catalogosApi.tiposEvento.obtenerPorId(eventoData.tipoEventoId),
          salonesApi.obtenerPorId(reservaActual.salonId),
        ]);

        if (cancelled) return;
        setCliente(clienteData);
        setTipoEvento(tipoEventoData);
        setSalon(salonData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar evento');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [eventId]);

  // Crear objeto event compatible con EventDetailHeaderTabs
  const event = useMemo(() => {
    if (!evento) {
      return {
        id: eventId || '',
        title: 'Cargando...',
        dateLabel: '',
        timeLabel: '',
        status: 'Pendiente' as const,
        customerName: '',
        customerPhone: '',
        eventType: '',
        guests: 0,
        venue: '',
        venueCapacity: '',
        totalQuote: '$0',
      };
    }

    const reserva = evento.reservas.find(r => r.vigente);
    const inicio = new Date(evento.fechaHoraInicio);
    
    return {
      id: evento.id,
      title: `${tipoEvento?.nombre || 'Evento'} - ${cliente?.nombreCompleto || 'Cliente'}`,
      dateLabel: inicio.toLocaleDateString('es-CO'),
      timeLabel: inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendiente' as const,
      customerName: cliente?.nombreCompleto || 'Cargando...',
      customerPhone: cliente?.telefono || '',
      eventType: tipoEvento?.nombre || 'Cargando...',
      guests: reserva?.numInvitados || 0,
      venue: salon?.nombre || 'Sin salón',
      venueCapacity: salon ? `Capacidad: ${salon.capacidad} pax` : '',
      totalQuote: '$0', // TODO: Obtener de cotización
    };
  }, [evento, cliente, salon, tipoEvento, eventId]);

  const paidAmount = useMemo(
    () => payments.reduce((sum, payment) => sum + payment.amount, 0),
    [payments]
  );

  const pendingAmount = Math.max(totalEventAmount - paidAmount, 0);
  const paidProgress = totalEventAmount > 0 ? Math.min((paidAmount / totalEventAmount) * 100, 100) : 0;
  const progressLabel = `${paidProgress.toFixed(1)}%`;
  const paymentStatusLabel = pendingAmount > 0 ? 'Saldo pendiente' : 'Pagado totalmente';
  const paymentHistory = useMemo(() => [...payments].reverse(), [payments]);

  // cotizacionId debe venir del contexto del evento; por ahora se usa un placeholder
  // que se reemplazará cuando EventSummaryPage cargue el evento real del backend.
  const cotizacionId = '';

  const registerPayment = async () => {
    if (newAmount <= 0 || !newDate || pendingAmount <= 0 || !newConcept.trim()) {
      return;
    }

    const safeAmount = Math.min(newAmount, pendingAmount);

    try {
      if (cotizacionId) {
        // Llamada real al backend
        const anticipo = await pagosApi.registrarAnticipo(cotizacionId, {
          usuarioId: '00000000-0000-0000-0000-000000000001', // reemplazar con usuario autenticado
          valor: safeAmount,
          metodoPago: newMethod,
          fechaPago: newDate,
          observaciones: newConcept.trim(),
        });

        setPayments((prev) => [
          ...prev,
          {
            id: anticipo.id,
            date: new Date(anticipo.fechaPago).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            concept: anticipo.observaciones ?? newConcept.trim(),
            method: anticipo.metodoPago,
            amount: Number(anticipo.valor),
            registeredBy: 'Usuario actual',
          },
        ]);
      } else {
        // Modo local mientras no haya cotizacionId disponible
        setPayments((prev) => [
          ...prev,
          {
            id: `pay-${Date.now()}`,
            date: new Date(newDate).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            concept: newConcept.trim(),
            method: newMethod,
            amount: safeAmount,
            registeredBy: 'Usuario actual',
          },
        ]);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al registrar el pago.');
      return;
    }

    setNewAmount(0);
    setNewDate('');
    setNewMethod('Transferencia');
    setNewConcept(pendingAmount - safeAmount <= 0 ? 'Abono final' : 'Anticipo');
  };

  if (loading) {
    return (
      <section className="space-y-8 pb-24">
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          Cargando información de pagos...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8 pb-24">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 pb-24">
      <EventDetailHeaderTabs event={event} activeTab="pagos" />

      <section className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Anticipos y pagos</p>
            <h3 className="text-xl font-display font-bold text-on-surface mt-1">
              {event.id} · {event.title.replace(' - ', ' · ')}
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              pendingAmount > 0 ? 'bg-gold-bg text-gold-d border border-gold/25' : 'bg-green-bg text-green-text border border-green-border'
            }`}
          >
            {paymentStatusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">Total evento</p>
            <p className="text-2xl font-display font-bold text-on-surface">{formatCurrency(totalEventAmount)}</p>
          </div>
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">Pagado</p>
            <p className="text-2xl font-display font-bold text-green-text">{formatCurrency(paidAmount)}</p>
          </div>
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2">Saldo</p>
            <p className="text-2xl font-display font-bold text-on-surface">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 rounded-full bg-surface-container-low overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all"
              style={{ width: `${paidProgress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm text-on-surface-variant">
            <span>Avance de pago</span>
            <span className="font-semibold">{progressLabel}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] gap-6">
        <section className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-5">
          <div>
            <h4 className="text-xl font-display font-bold text-on-surface">Registrar anticipo o abono</h4>
            <p className="text-sm text-on-surface-variant mt-1">El valor registrado no puede superar el saldo pendiente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Concepto</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                type="text"
                value={newConcept}
                onChange={(eventTarget) => setNewConcept(eventTarget.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Método de pago</label>
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

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-2">Valor</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                type="number"
                min={0}
                value={newAmount}
                onChange={(eventTarget) => setNewAmount(Math.max(0, Number(eventTarget.target.value) || 0))}
              />
              <p className="text-xs text-on-surface-variant mt-2">
                Máximo permitido: {formatCurrency(pendingAmount)}
              </p>
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
          </div>

          <button
            type="button"
            className="bg-primary-gold text-white px-5 py-2.5 rounded-md text-sm font-bold hover:bg-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={newAmount <= 0 || !newDate || pendingAmount <= 0 || !newConcept.trim()}
            onClick={registerPayment}
          >
            Registrar pago
          </button>
        </section>

        <aside className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xl font-display font-bold text-on-surface">Historial de pagos</h4>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
              {payments.length} registros
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
            <table className="w-full min-w-[640px] text-left">
              <thead className="bg-surface-container-low text-[11px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2.5">Fecha</th>
                  <th className="px-3 py-2.5">Concepto</th>
                  <th className="px-3 py-2.5">Método</th>
                  <th className="px-3 py-2.5">Valor</th>
                  <th className="px-3 py-2.5">Registrado por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest text-sm">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-3 py-2.5 text-on-surface-variant whitespace-nowrap">{payment.date}</td>
                    <td className="px-3 py-2.5 font-semibold text-on-surface">{payment.concept}</td>
                    <td className="px-3 py-2.5 text-on-surface-variant">{payment.method}</td>
                    <td className="px-3 py-2.5 font-semibold text-green-text whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-on-surface-variant">{payment.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default EventPaymentsPage;

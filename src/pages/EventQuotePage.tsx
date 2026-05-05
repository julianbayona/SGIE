import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import eventosApi from '@/api/eventos';
import cotizacionesApi from '@/api/cotizaciones';
import clientesApi from '@/api/clientes';
import salonesApi from '@/api/salones';
import catalogosApi from '@/api/catalogos';
import type { EventoResponse, CotizacionResponse, EstadoCotizacion, ClienteResponse, SalonResponse, CatalogoBasicoResponse } from '@/api/types';
import type { QuoteStatus } from '@/features/quotes/types';

const estadoMap: Record<EstadoCotizacion, QuoteStatus> = {
  BORRADOR: 'Borrador',
  GENERADA: 'Generada',
  ENVIADA: 'Enviada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  DESACTUALIZADA: 'Desactualizada',
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const EventQuotePage: React.FC = () => {
  const { eventId } = useParams();
  
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [cotizacion, setCotizacion] = useState<CotizacionResponse | null>(null);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [salon, setSalon] = useState<SalonResponse | null>(null);
  const [tipoEvento, setTipoEvento] = useState<CatalogoBasicoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [advancePercent, setAdvancePercent] = useState(20);

  // Cargar evento y cotización
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

        const reserva = eventoData.reservas.find(r => r.vigente);
        if (!reserva) {
          setError('No hay reserva activa para este evento');
          setLoading(false);
          return;
        }

        // Cargar datos relacionados en paralelo
        const [clienteData, tipoEventoData, salonData] = await Promise.all([
          clientesApi.obtenerPorId(eventoData.clienteId),
          catalogosApi.tiposEvento.obtenerPorId(eventoData.tipoEventoId),
          salonesApi.obtenerPorId(reserva.salonId),
        ]);

        if (cancelled) return;
        setCliente(clienteData);
        setTipoEvento(tipoEventoData);
        setSalon(salonData);

        // Intentar cargar cotización existente
        try {
          // TODO: Implementar endpoint para obtener cotización por reservaId
          // const cotizacionData = await cotizacionesApi.obtenerPorReserva(reserva.id);
          // setCotizacion(cotizacionData);
          
          // Por ahora, generar cotización si no existe
          const cotizacionData = await cotizacionesApi.generar(reserva.id, {
            usuarioId: '00000000-0000-0000-0000-000000000001',
            descuento: 0,
            observaciones: null,
          });
          
          if (cancelled) return;
          setCotizacion(cotizacionData);
        } catch (cotErr) {
          console.log('Error al cargar/generar cotización:', cotErr);
          setError('No se pudo cargar la cotización. Asegúrate de haber configurado el menú y montaje.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [eventId]);

  const isDraft = cotizacion?.estado === 'BORRADOR';
  const quoteStatus = cotizacion ? estadoMap[cotizacion.estado] : 'Borrador';

  const adjustedTotal = cotizacion?.valorTotal || 0;
  const baseTotal = cotizacion?.valorSubtotal || 0;
  const deltaTotal = adjustedTotal - baseTotal;
  const advanceValue = Math.round((adjustedTotal * advancePercent) / 100);
  const remainingValue = adjustedTotal - advanceValue;

  // Mapear items de cotización a formato de UI
  const quoteItems = useMemo(() => {
    if (!cotizacion) return [];
    
    return cotizacion.items.map(item => {
      // Determinar origen y modo de cobro desde tipoConcepto
      let source: 'salon' | 'menu' | 'montaje' = 'montaje';
      let pricingMode: 'servicio' | 'unidad' = 'unidad';
      
      if (item.tipoConcepto.includes('SALON') || item.tipoConcepto.includes('ALQUILER')) {
        source = 'salon';
        pricingMode = 'servicio';
      } else if (item.tipoConcepto.includes('MENU') || item.tipoConcepto.includes('PLATO')) {
        source = 'menu';
        pricingMode = 'unidad';
      } else if (item.tipoConcepto.includes('MONTAJE') || item.tipoConcepto.includes('ADICIONAL')) {
        source = 'montaje';
        // Los adicionales pueden ser por servicio o por unidad
        pricingMode = item.cantidad === 1 ? 'servicio' : 'unidad';
      }

      return {
        id: item.id,
        concept: item.descripcion,
        source,
        pricingMode,
        quantity: item.cantidad,
        unitBasePrice: item.precioBase,
        unitAdjustedPrice: item.precioOverride ?? item.precioBase,
        notes: null,
      };
    });
  }, [cotizacion]);

  // Separar items de menú y montaje para el sidebar
  const menuItems = useMemo(() => {
    return quoteItems.filter(item => item.source === 'menu');
  }, [quoteItems]);

  const montageItems = useMemo(() => {
    return quoteItems.filter(item => item.source === 'montaje');
  }, [quoteItems]);

  const updateAdjustedPrice = async (itemId: string, nuevoPrecio: number) => {
    if (!cotizacion || !isDraft) return;

    try {
      setSaving(true);
      await cotizacionesApi.actualizarItem(cotizacion.id, itemId, {
        precioOverride: nuevoPrecio,
      });

      // Recargar cotización
      const cotizacionActualizada = await cotizacionesApi.obtenerPorId(cotizacion.id);
      setCotizacion(cotizacionActualizada);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar precio');
    } finally {
      setSaving(false);
    }
  };

  const handleEnviarCotizacion = async () => {
    if (!cotizacion) return;

    try {
      setSaving(true);
      const cotizacionActualizada = await cotizacionesApi.enviar(cotizacion.id);
      setCotizacion(cotizacionActualizada);
      alert('Cotización enviada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar cotización');
    } finally {
      setSaving(false);
    }
  };

  const handleAceptarCotizacion = async () => {
    if (!cotizacion) return;

    try {
      setSaving(true);
      const cotizacionActualizada = await cotizacionesApi.aceptar(cotizacion.id);
      setCotizacion(cotizacionActualizada);
      alert('Cotización aceptada exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar cotización');
    } finally {
      setSaving(false);
    }
  };

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
      totalQuote: formatCurrency(adjustedTotal),
    };
  }, [evento, cliente, salon, tipoEvento, eventId, adjustedTotal]);

  if (loading) {
    return (
      <section className="space-y-8 pb-28">
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          Cargando cotización...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8 pb-28">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <Link
          to={`/events/${eventId}/menu`}
          className="inline-flex items-center gap-2 text-primary-gold font-bold hover:underline"
        >
          ← Volver a configurar menú
        </Link>
      </section>
    );
  }

  if (!cotizacion) {
    return (
      <section className="space-y-8 pb-28">
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No hay cotización disponible. Configura el menú y montaje primero.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 pb-28">
      <EventDetailHeaderTabs event={event} activeTab="cotizacion" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 space-y-6 mb-20">
          <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Cotización activa</p>
                <h3 className="font-display text-2xl font-bold text-on-surface mt-1">
                  #{event.id.replace('EVT', 'COT').replace('EV-', 'COT-')}
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {event.title.replace(' - ', ' - ')} - {event.dateLabel}
                </p>
              </div>
              <StatusBadge type="quote" status={quoteStatus} size="md" />
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h4 className="font-display text-base font-bold text-blue-900">Origen de los datos</h4>
                <p className="mt-1 max-w-3xl text-sm text-blue-900">
                  Esta cotización se genera desde el menú y montaje del evento. Para cambiar platos, cantidades o
                  adicionales, edita esas pestañas; aquí solo se revisan precios, descuento, anticipo y envío.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-100"
                  to={`/events/${event.id}/menu`}
                >
                  Ir a Menú
                </Link>
                <Link
                  className="rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-100"
                  to={`/events/${event.id}/montaje`}
                >
                  Ir a Montaje
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-lg font-bold text-on-surface">Detalle económico</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Las cantidades son de solo lectura porque pertenecen a Menú y Montaje.
                </p>
              </div>
              {!isDraft ? (
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-600">
                  Documento no editable
                </span>
              ) : null}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Concepto</th>
                    <th className="px-4 py-3">Origen</th>
                    <th className="px-4 py-3">Cobro</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Precio base</th>
                    <th className="px-4 py-3 text-right">Precio ajustado</th>
                    <th className="px-6 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {quoteItems.map((item) => {
                    const hasAdjustment = item.unitAdjustedPrice !== item.unitBasePrice;

                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-on-surface">{item.concept}</p>
                          {item.notes ? <p className="text-xs text-on-surface-variant mt-1">{item.notes}</p> : null}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-bold text-on-surface-variant">
                            {item.source === 'salon' ? 'Salón' : item.source === 'menu' ? 'Menú' : 'Montaje'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-on-surface-variant">
                          {item.pricingMode === 'servicio' ? 'Por servicio' : 'Por unidad'}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-on-surface">
                          {item.pricingMode === 'servicio' ? '1 servicio' : `${item.quantity} pax`}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-on-surface-variant">
                          {formatCurrency(item.unitBasePrice)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <input
                            className={`w-28 rounded-md border px-2 py-1.5 text-right text-sm ${
                              isDraft
                                ? 'bg-surface-container-low'
                                : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                            } ${hasAdjustment ? 'border-primary-gold/60' : 'border-outline-variant/40'}`}
                            type="number"
                            min={0}
                            step={1000}
                            value={item.unitAdjustedPrice}
                            disabled={!isDraft}
                            onChange={(eventTarget) => updateAdjustedPrice(item.id, Number(eventTarget.target.value))}
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-on-surface">
                          {formatCurrency(item.quantity * item.unitAdjustedPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm">
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
          <div className="bg-surface-container-lowest border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Resumen financiero</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total base</span>
                <span className="font-medium text-on-surface">{formatCurrency(baseTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total ajustado</span>
                <span className="font-medium text-on-surface">{formatCurrency(adjustedTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/20 pt-2">
                <span className="text-on-surface-variant">Ajuste neto</span>
                <span className={`font-semibold ${deltaTotal >= 0 ? 'text-primary-gold' : 'text-green-text'}`}>
                  {deltaTotal >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(deltaTotal))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Detalle solicitado</h4>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-bold text-neutral-500">Menú solicitado</p>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div key={item.id} className="text-sm">
                    <p className="font-semibold text-on-surface">{item.concept}</p>
                    <p className="text-on-surface-variant text-xs">
                      {item.quantity} pax - {formatCurrency(item.unitAdjustedPrice)} c/u
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No hay items de menú</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-outline-variant/20">
              <p className="text-xs uppercase tracking-wider font-bold text-neutral-500">Montaje y adicionales</p>
              {montageItems.length > 0 ? (
                montageItems.map((item) => (
                  <div key={item.id} className="text-sm flex items-center justify-between gap-3">
                    <p className="font-semibold text-on-surface">{item.concept}</p>
                    <p className="text-on-surface-variant text-xs">
                      {item.pricingMode === 'unidad' ? `x${item.quantity}` : '1 servicio'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No hay items de montaje</p>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Historial cotizaciones</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-on-surface">#{cotizacion.id.slice(0, 8).toUpperCase()}</p>
                    <span className="text-[10px] font-bold text-gold">Activa</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    {new Date().toLocaleDateString('es-CO')}
                  </p>
                </div>
                <StatusBadge type="quote" status={quoteStatus} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-container px-6 py-4 flex justify-between items-center z-[60]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Solo el borrador permite ajustar precios; las cantidades se corrigen en Menú o Montaje
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-container-low transition-colors rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled={saving}
          >
            Guardar borrador
          </button>
          <button
            className="flex-1 sm:flex-none border border-green-text/40 text-green-text hover:bg-green-bg transition-colors rounded-md px-5 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleEnviarCotizacion}
            disabled={saving || !isDraft}
          >
            Enviar por WhatsApp
          </button>
          <button
            className="flex-1 sm:flex-none bg-primary-gold text-white rounded-md px-6 py-2.5 text-sm font-bold shadow-sm hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            onClick={handleAceptarCotizacion}
            disabled={saving || cotizacion?.estado !== 'ENVIADA'}
          >
            Registrar aceptación
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventQuotePage;

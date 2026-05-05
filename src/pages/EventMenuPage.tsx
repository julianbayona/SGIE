import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import eventosApi from '@/api/eventos';
import clientesApi from '@/api/clientes';
import salonesApi from '@/api/salones';
import catalogosApi from '@/api/catalogos';
import type { EventoResponse, ClienteResponse, SalonResponse, CatalogoBasicoResponse } from '@/api/types';

interface MenuLine {
  id: string;
  moment: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const createLineId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const EventMenuPage: React.FC = () => {
  const { eventId } = useParams();
  
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [salon, setSalon] = useState<SalonResponse | null>(null);
  const [tipoEvento, setTipoEvento] = useState<CatalogoBasicoResponse | null>(null);
  const [menuLines, setMenuLines] = useState<MenuLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const guests = evento?.reservas.find(r => r.vigente)?.numInvitados || 0;

  const [newMoment, setNewMoment] = useState('Entrada');
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState(guests);
  const [newPrice, setNewPrice] = useState(0);
  const [newNotes, setNewNotes] = useState('');
  const [exceptionsText, setExceptionsText] = useState('');

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

  // Actualizar cantidad sugerida cuando cambian los invitados
  useEffect(() => {
    setNewQuantity(guests);
  }, [guests]);

  const menuTotal = useMemo(() => {
    return menuLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  }, [menuLines]);

  const costPerGuest = guests > 0 ? Math.round(menuTotal / guests) : 0;

  const updateLineQuantity = (lineId: string, quantity: number) => {
    setMenuLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, quantity: Math.max(1, Number.isNaN(quantity) ? 1 : quantity) } : line
      )
    );
  };

  const updateLineNotes = (lineId: string, notes: string) => {
    setMenuLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, notes } : line)));
  };

  const addMenuLine = () => {
    if (!newName.trim() || newPrice <= 0) {
      setError('Completa el nombre y precio del plato');
      return;
    }
    
    const quantity = Math.max(1, Number.isNaN(newQuantity) ? 1 : newQuantity);

    setMenuLines((prev) => [
      ...prev,
      {
        id: createLineId(),
        moment: newMoment,
        name: newName.trim(),
        quantity,
        unitPrice: newPrice,
        notes: newNotes.trim(),
      },
    ]);
    
    setNewName('');
    setNewPrice(0);
    setNewQuantity(guests);
    setNewNotes('');
    setError(null);
  };

  const handleSaveMenu = () => {
    if (menuLines.length === 0) {
      setError('Agrega al menos un plato al menú antes de guardar');
      return;
    }

    // TODO: Implementar guardado cuando el backend tenga el endpoint configurado
    alert('Menú guardado localmente. Pendiente: integración con backend.');
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
      totalQuote: '$0',
    };
  }, [evento, cliente, salon, tipoEvento, eventId]);

  if (loading) {
    return (
      <section className="space-y-8 pb-32">
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          Cargando menú del evento...
        </div>
      </section>
    );
  }

  if (error && !evento) {
    return (
      <section className="space-y-8 pb-32">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="menu" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 space-y-6 mb-24">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Ficha gastronómica</p>
                <h3 className="font-display text-2xl font-bold text-on-surface mt-1">Menú del evento</h3>
                <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
                  Aquí se define lo que el cliente pidió para el evento. La cotización toma estas cantidades como fuente
                  de verdad y solo permite ajustes económicos.
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                En edición
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20">
              <h4 className="font-display text-lg font-bold text-on-surface">Items solicitados</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                Cambia cantidades o especificaciones aquí antes de generar o actualizar la cotización.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-6 py-3">Momento</th>
                    <th className="px-4 py-3">Selección</th>
                    <th className="px-4 py-3 text-right">Cantidad</th>
                    <th className="px-4 py-3 text-right">Precio base</th>
                    <th className="px-4 py-3">Especificaciones</th>
                    <th className="px-6 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {menuLines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-6 py-4 text-sm font-semibold text-on-surface">{line.moment}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-on-surface">{line.name}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <input
                          className="w-20 rounded-md border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-right text-sm"
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(eventTarget) => updateLineQuantity(line.id, Number(eventTarget.target.value))}
                        />
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-on-surface-variant">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="px-4 py-4">
                        <input
                          className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-sm"
                          type="text"
                          value={line.notes}
                          placeholder="Sin observaciones"
                          onChange={(eventTarget) => updateLineNotes(line.id, eventTarget.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-sm font-semibold text-red-700 hover:text-red-800"
                          type="button"
                          onClick={() => setMenuLines((prev) => prev.filter((item) => item.id !== line.id))}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-display text-lg font-bold text-on-surface">Agregar ítem al menú</h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  Usa esta sección para sumar una bebida, plato alterno o componente adicional del menú.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Momento</label>
                  <select
                    className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                    value={newMoment}
                    onChange={(eventTarget) => setNewMoment(eventTarget.target.value)}
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Consomé">Consomé</option>
                    <option value="Plato fuerte">Plato fuerte</option>
                    <option value="Postre">Postre</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Nombre del plato</label>
                  <input
                    className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                    type="text"
                    value={newName}
                    placeholder="Ej: Carpaccio de res"
                    onChange={(eventTarget) => setNewName(eventTarget.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Precio</label>
                  <input
                    className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                    type="number"
                    min={0}
                    value={newPrice || ''}
                    placeholder="0"
                    onChange={(eventTarget) => setNewPrice(Number(eventTarget.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Cantidad</label>
                  <input
                    className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={(eventTarget) => setNewQuantity(Number(eventTarget.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    className="w-full rounded-md bg-primary-gold px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary disabled:opacity-50"
                    type="button"
                    onClick={addMenuLine}
                    disabled={!newName.trim() || newPrice <= 0}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-4">
              <h4 className="font-display text-lg font-bold text-on-surface">Excepciones alimentarias</h4>
              <textarea
                className="min-h-[118px] w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-3 text-sm"
                value={exceptionsText}
                placeholder="Ej: personas vegetarianas, alergias, menú infantil..."
                onChange={(eventTarget) => setExceptionsText(eventTarget.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        <aside className="lg:w-[330px] space-y-6 lg:sticky lg:top-[92px]">
          <div className="bg-surface-container-lowest border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Resumen del menú</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Invitados</span>
                <span className="font-semibold text-on-surface">{guests} pax</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Items definidos</span>
                <span className="font-semibold text-on-surface">{menuLines.length}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Estimado por invitado</span>
                <span className="font-semibold text-on-surface">{formatCurrency(costPerGuest)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-outline-variant/20 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total menú</span>
                <span className="font-display text-lg font-bold text-primary-gold">{formatCurrency(menuTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-base text-amber-800">Impacto en cotización</h4>
            <p className="text-sm text-amber-800">
              Si la cotización está en borrador, estos cambios recalculan el documento. Si ya fue enviada, debe quedar
              desactualizada y generar una nueva.
            </p>
            <Link
              className="inline-flex w-full items-center justify-center rounded-md border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100"
              to={`/events/${event.id}/cotizacion`}
            >
              Ir a cotización
            </Link>
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 z-[60] flex w-full items-center justify-between border-t border-surface-container bg-surface-container-lowest/90 px-6 py-4 backdrop-blur-md md:w-[calc(100%-16rem)]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Menús y cantidades se editan aquí, no dentro de la cotización
          </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            className="flex-1 rounded-md border border-green-text/40 px-5 py-2.5 text-sm font-semibold text-green-text transition-colors hover:bg-green-bg sm:flex-none"
            type="button"
          >
            Enviar propuesta por WhatsApp
          </button>
          <button
            className="flex-1 rounded-md bg-primary-gold px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary sm:flex-none disabled:opacity-50"
            type="button"
            onClick={handleSaveMenu}
            disabled={menuLines.length === 0}
          >
            Guardar menú
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMenuPage;

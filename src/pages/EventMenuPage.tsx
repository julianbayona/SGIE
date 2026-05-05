import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import eventosApi from '@/api/eventos';
import clientesApi from '@/api/clientes';
import salonesApi from '@/api/salones';
import catalogosApi from '@/api/catalogos';
import menusApi from '@/api/menus';
import type {
  EventoResponse,
  ClienteResponse,
  SalonResponse,
  CatalogoBasicoResponse,
  PlatoResponse,
  TipoMomentoMenuResponse,
} from '@/api/types';

// ─── tipos locales ────────────────────────────────────────────────────────────

interface ItemLocal {
  /** id temporal solo para React key */
  localId: string;
  platoId: string;
  platoNombre: string;
  precioBase: number;
  cantidad: number;
  excepciones: string;
}

interface SeleccionLocal {
  tipoMomentoId: string;
  items: ItemLocal[];
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── componente ──────────────────────────────────────────────────────────────

const EventMenuPage: React.FC = () => {
  const { eventId } = useParams();

  // datos del evento
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [salon, setSalon] = useState<SalonResponse | null>(null);
  const [tipoEvento, setTipoEvento] = useState<CatalogoBasicoResponse | null>(null);

  // catálogos
  const [platos, setPlatos] = useState<PlatoResponse[]>([]);
  const [momentos, setMomentos] = useState<TipoMomentoMenuResponse[]>([]);

  // estado del formulario
  const [selecciones, setSelecciones] = useState<SeleccionLocal[]>([]);
  const [notasGenerales, setNotasGenerales] = useState('');

  // controles de UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulario para agregar un ítem
  const [addMomentoId, setAddMomentoId] = useState('');
  const [addPlatoId, setAddPlatoId] = useState('');
  const [addCantidad, setAddCantidad] = useState(1);
  const [addExcepciones, setAddExcepciones] = useState('');

  const guests = evento?.reservas.find(r => r.vigente)?.numInvitados ?? 0;

  // ── carga inicial ────────────────────────────────────────────────────────
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

        const [platosApiData, momentosApiData] = await Promise.all([
          catalogosApi.platos.listar(),
          catalogosApi.tiposMomentoMenu.listar(),
        ]);

        const platosData = platosApiData.filter((plato) => plato.activo);
        const momentosData = momentosApiData.filter((momento) => momento.activo);

        setPlatos(platosData);
        setMomentos(momentosData);

        // inicializar selector con el primer momento disponible
        if (momentosData.length > 0) setAddMomentoId(momentosData[0]!.id);
        if (platosData.length > 0) setAddPlatoId(platosData[0]!.id);

        const reserva = eventoData.reservas.find(r => r.vigente);
        if (!reserva) {
          setError('No hay reserva activa para este evento');
          setLoading(false);
          return;
        }

        const reservaId = reserva.reservaRaizId || reserva.id;

        // cargar datos relacionados
        const [clienteData, tipoEventoData, salonData] = await Promise.all([
          clientesApi.obtenerPorId(eventoData.clienteId),
          catalogosApi.tiposEvento.obtenerPorId(eventoData.tipoEventoId),
          salonesApi.obtenerPorId(reserva.salonId),
        ]);
        if (cancelled) return;
        setCliente(clienteData);
        setTipoEvento(tipoEventoData);
        setSalon(salonData);

        // intentar cargar menú existente
        try {
          const menuExistente = await menusApi.obtener(reservaId);
          if (cancelled) return;
          setNotasGenerales(menuExistente.notasGenerales ?? '');
          // reconstruir selecciones locales desde la respuesta
          const sels: SeleccionLocal[] = menuExistente.selecciones.map(sel => ({
            tipoMomentoId: sel.tipoMomentoId,
            items: sel.items.map(it => {
              const plato = platosData.find(p => p.id === it.platoId);
              return {
                localId: uid(),
                platoId: it.platoId,
                platoNombre: plato?.nombre ?? it.platoId,
                precioBase: plato?.precioBase ?? 0,
                cantidad: it.cantidad,
                excepciones: it.excepciones ?? '',
              };
            }),
          }));
          setSelecciones(sels);
        } catch {
          // no hay menú aún — empezar vacío
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [eventId]);

  // ── helpers ──────────────────────────────────────────────────────────────

  const totalMenu = useMemo(
    () => selecciones.flatMap(s => s.items).reduce((acc, it) => acc + it.precioBase * it.cantidad, 0),
    [selecciones],
  );

  const costoPorInvitado = guests > 0 ? Math.round(totalMenu / guests) : 0;

  const agregarItem = () => {
    if (!addMomentoId || !addPlatoId) return;
    const plato = platos.find(p => p.id === addPlatoId);
    if (!plato) return;

    const nuevoItem: ItemLocal = {
      localId: uid(),
      platoId: plato.id,
      platoNombre: plato.nombre,
      precioBase: Number(plato.precioBase),
      cantidad: Math.max(1, addCantidad),
      excepciones: addExcepciones.trim(),
    };

    setSelecciones(prev => {
      const idx = prev.findIndex(s => s.tipoMomentoId === addMomentoId);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx]!, items: [...copia[idx]!.items, nuevoItem] };
        return copia;
      }
      return [...prev, { tipoMomentoId: addMomentoId, items: [nuevoItem] }];
    });

    // reset campos de agregar
    setAddCantidad(guests || 1);
    setAddExcepciones('');
    setError(null);
  };

  const quitarItem = (momentoId: string, localId: string) => {
    setSelecciones(prev =>
      prev
        .map(s =>
          s.tipoMomentoId === momentoId
            ? { ...s, items: s.items.filter(it => it.localId !== localId) }
            : s,
        )
        .filter(s => s.items.length > 0),
    );
  };

  const actualizarCantidad = (momentoId: string, localId: string, cantidad: number) => {
    setSelecciones(prev =>
      prev.map(s =>
        s.tipoMomentoId === momentoId
          ? { ...s, items: s.items.map(it => it.localId === localId ? { ...it, cantidad: Math.max(1, cantidad) } : it) }
          : s,
      ),
    );
  };

  const actualizarExcepciones = (momentoId: string, localId: string, excepciones: string) => {
    setSelecciones(prev =>
      prev.map(s =>
        s.tipoMomentoId === momentoId
          ? { ...s, items: s.items.map(it => it.localId === localId ? { ...it, excepciones } : it) }
          : s,
      ),
    );
  };

  // ── guardar ──────────────────────────────────────────────────────────────

  const handleGuardarMenu = async () => {
    if (!evento) return;
    const reserva = evento.reservas.find(r => r.vigente);
    if (!reserva) { setError('No hay reserva activa'); return; }
    const reservaId = reserva.reservaRaizId || reserva.id;
    if (selecciones.length === 0) { setError('Agrega al menos un plato antes de guardar'); return; }

    try {
      setSaving(true);
      setSavedOk(false);
      setError(null);

      await menusApi.configurar(reservaId, {
        notasGenerales: notasGenerales.trim() || undefined,
        selecciones: selecciones.map(s => ({
          tipoMomentoId: s.tipoMomentoId,
          items: s.items.map(it => ({
            platoId: it.platoId,
            cantidad: it.cantidad,
            excepciones: it.excepciones || undefined,
          })),
        })),
      });

      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar menú');
    } finally {
      setSaving(false);
    }
  };

  // ── objeto event para el header ──────────────────────────────────────────

  const event = useMemo(() => {
    if (!evento) {
      return { id: eventId ?? '', title: 'Cargando...', dateLabel: '', timeLabel: '', status: 'Pendiente' as const, customerName: '', customerPhone: '', eventType: '', guests: 0, venue: '', venueCapacity: '', totalQuote: '$0' };
    }
    const reserva = evento.reservas.find(r => r.vigente);
    const inicio = new Date(evento.fechaHoraInicio);
    return {
      id: evento.id,
      title: `${tipoEvento?.nombre ?? 'Evento'} - ${cliente?.nombreCompleto ?? 'Cliente'}`,
      dateLabel: inicio.toLocaleDateString('es-CO'),
      timeLabel: inicio.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendiente' as const,
      customerName: cliente?.nombreCompleto ?? 'Cargando...',
      customerPhone: cliente?.telefono ?? '',
      eventType: tipoEvento?.nombre ?? 'Cargando...',
      guests: reserva?.numInvitados ?? 0,
      venue: salon?.nombre ?? 'Sin salón',
      venueCapacity: salon ? `Capacidad: ${salon.capacidad} pax` : '',
      totalQuote: '$0',
    };
  }, [evento, cliente, salon, tipoEvento, eventId]);

  // ── render ────────────────────────────────────────────────────────────────

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
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </section>
    );
  }

  const momentoNombre = (id: string) => momentos.find(m => m.id === id)?.nombre ?? id;

  return (
    <section className="space-y-8 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="menu" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 space-y-6 mb-24">

          {/* banner de error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* banner de éxito */}
          {savedOk && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
              ✓ Menú guardado correctamente
            </div>
          )}

          {/* cabecera */}
          <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Ficha gastronómica</p>
                <h3 className="font-display text-2xl font-bold text-on-surface mt-1">Menú del evento</h3>
                <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
                  Selecciona los platos del catálogo para cada momento. La cotización toma estas cantidades como fuente de verdad.
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                En edición
              </span>
            </div>
          </div>

          {/* tabla de items actuales */}
          <div className="bg-surface-container-lowest border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/20">
              <h4 className="font-display text-lg font-bold text-on-surface">Items del menú</h4>
              <p className="text-sm text-on-surface-variant mt-1">
                {selecciones.length === 0
                  ? 'Aún no hay platos. Usa el formulario de abajo para agregar.'
                  : `${selecciones.flatMap(s => s.items).length} plato(s) en ${selecciones.length} momento(s)`}
              </p>
            </div>

            {selecciones.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-6 py-3">Momento</th>
                      <th className="px-4 py-3">Plato</th>
                      <th className="px-4 py-3 text-right">Precio base</th>
                      <th className="px-4 py-3 text-right">Cantidad</th>
                      <th className="px-4 py-3">Excepciones</th>
                      <th className="px-6 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {selecciones.flatMap(sel =>
                      sel.items.map(it => (
                        <tr key={it.localId}>
                          <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                            {momentoNombre(sel.tipoMomentoId)}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-on-surface">{it.platoNombre}</td>
                          <td className="px-4 py-4 text-right text-sm text-on-surface-variant">
                            {formatCurrency(it.precioBase)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <input
                              className="w-20 rounded-md border border-outline-variant/40 bg-surface-container-low px-2 py-1.5 text-right text-sm"
                              type="number"
                              min={1}
                              value={it.cantidad}
                              onChange={e => actualizarCantidad(sel.tipoMomentoId, it.localId, Number(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-sm"
                              type="text"
                              value={it.excepciones}
                              placeholder="Sin observaciones"
                              onChange={e => actualizarExcepciones(sel.tipoMomentoId, it.localId, e.target.value)}
                            />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className="text-sm font-semibold text-red-700 hover:text-red-800"
                              type="button"
                              onClick={() => quitarItem(sel.tipoMomentoId, it.localId)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* formulario agregar ítem */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-6">
            <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-display text-lg font-bold text-on-surface">Agregar plato al menú</h4>
                <p className="text-sm text-on-surface-variant mt-1">Selecciona el momento y el plato del catálogo.</p>
              </div>

              {platos.length === 0 || momentos.length === 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {platos.length === 0
                    ? 'No hay platos en el catálogo. Agrega platos desde la sección de Catálogos.'
                    : 'No hay momentos de menú en el catálogo.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  {/* momento */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-neutral-700 mb-2">Momento</label>
                    <select
                      className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                      value={addMomentoId}
                      onChange={e => setAddMomentoId(e.target.value)}
                    >
                      {momentos.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* plato */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-neutral-700 mb-2">Plato</label>
                    <select
                      className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                      value={addPlatoId}
                      onChange={e => setAddPlatoId(e.target.value)}
                    >
                      {platos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — {formatCurrency(Number(p.precioBase))}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* cantidad */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 mb-2">Cantidad</label>
                    <input
                      className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                      type="number"
                      min={1}
                      value={addCantidad}
                      onChange={e => setAddCantidad(Number(e.target.value) || 1)}
                    />
                  </div>

                  {/* botón */}
                  <div className="md:col-span-3">
                    <button
                      className="w-full rounded-md bg-primary-gold px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary disabled:opacity-50"
                      type="button"
                      onClick={agregarItem}
                      disabled={!addMomentoId || !addPlatoId}
                    >
                      + Agregar
                    </button>
                  </div>

                  {/* excepciones (fila completa) */}
                  <div className="md:col-span-12">
                    <label className="block text-xs font-bold text-neutral-700 mb-2">
                      Excepciones para este plato (opcional)
                    </label>
                    <input
                      className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-2.5 text-sm"
                      type="text"
                      value={addExcepciones}
                      placeholder="Ej: sin cebolla, sin gluten..."
                      onChange={e => setAddExcepciones(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* notas generales */}
            <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm space-y-4">
              <h4 className="font-display text-lg font-bold text-on-surface">Notas generales</h4>
              <textarea
                className="min-h-[140px] w-full rounded-md border border-outline-variant/40 bg-surface-container-low px-3 py-3 text-sm"
                value={notasGenerales}
                placeholder="Ej: personas vegetarianas, alergias, menú infantil..."
                onChange={e => setNotasGenerales(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* sidebar */}
        <aside className="lg:w-[330px] space-y-6 lg:sticky lg:top-[92px]">
          <div className="bg-surface-container-lowest border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Resumen del menú</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Invitados</span>
                <span className="font-semibold text-on-surface">{guests} pax</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Platos definidos</span>
                <span className="font-semibold text-on-surface">
                  {selecciones.flatMap(s => s.items).length}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Estimado por invitado</span>
                <span className="font-semibold text-on-surface">{formatCurrency(costoPorInvitado)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-outline-variant/20 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total menú</span>
                <span className="font-display text-lg font-bold text-primary-gold">{formatCurrency(totalMenu)}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-base text-amber-800">Impacto en cotización</h4>
            <p className="text-sm text-amber-800">
              Guarda el menú antes de ir a cotización. Los cambios aquí recalculan el documento si está en borrador.
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

      {/* footer fijo */}
      <footer className="fixed bottom-0 right-0 z-[60] flex w-full items-center justify-between border-t border-surface-container bg-surface-container-lowest/90 px-6 py-4 backdrop-blur-md md:w-[calc(100%-16rem)]">
        <div className="hidden sm:flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-neutral-400">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Menús y cantidades se editan aquí, no dentro de la cotización
          </p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            className="flex-1 rounded-md bg-primary-gold px-8 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary sm:flex-none disabled:opacity-50"
            type="button"
            onClick={handleGuardarMenu}
            disabled={saving || selecciones.length === 0}
          >
            {saving ? 'Guardando...' : 'Guardar menú'}
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMenuPage;

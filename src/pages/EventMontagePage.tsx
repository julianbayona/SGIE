import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import eventosApi from '@/api/eventos';
import montajesApi from '@/api/montajes';
import catalogosApi from '@/api/catalogos';
import clientesApi from '@/api/clientes';
import salonesApi from '@/api/salones';
import type { 
  EventoResponse, 
  CatalogoBasicoResponse, 
  TipoAdicionalResponse,
  MontajeResponse,
  ClienteResponse,
  SalonResponse
} from '@/api/types';

interface InfrastructureItem {
  id: string;
  name: string;
  selected: boolean;
}

interface AdditionalItem {
  id: string;
  tipoAdicionalId: string;
  name: string;
  billingType: 'POR_SERVICIO' | 'POR_UNIDAD';
  selected: boolean;
  quantity: number;
  basePrice: number;
}

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const EventMontagePage: React.FC = () => {
  const { eventId } = useParams();
  
  // Estados para datos del API
  const [evento, setEvento] = useState<EventoResponse | null>(null);
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [salon, setSalon] = useState<SalonResponse | null>(null);
  const [tipoEvento, setTipoEvento] = useState<CatalogoBasicoResponse | null>(null);
  const [tiposMesa, setTiposMesa] = useState<CatalogoBasicoResponse[]>([]);
  const [tiposSilla, setTiposSilla] = useState<CatalogoBasicoResponse[]>([]);
  const [manteles, setManteles] = useState<CatalogoBasicoResponse[]>([]);
  const [sobremanteles, setSobremanteles] = useState<CatalogoBasicoResponse[]>([]);
  const [colores, setColores] = useState<CatalogoBasicoResponse[]>([]);
  const [tiposAdicional, setTiposAdicional] = useState<TipoAdicionalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados del formulario
  const [tableType, setTableType] = useState('');
  const [chairType, setChairType] = useState('');
  const [peoplePerTable, setPeoplePerTable] = useState(10);
  const [tableCount, setTableCount] = useState(12);
  const [clothType, setClothType] = useState('');
  const [clothColor, setClothColor] = useState('');
  const [topClothType, setTopClothType] = useState('');
  const [topClothColor, setTopClothColor] = useState('');
  const [dinnerware, setDinnerware] = useState(false);
  const [fajonEnabled, setFajonEnabled] = useState(true);

  const [infrastructure, setInfrastructure] = useState<InfrastructureItem[]>([
    { id: 'mesa_ponque', name: 'Mesa ponque', selected: false },
    { id: 'mesa_regalos', name: 'Mesa regalos', selected: false },
    { id: 'espacio_musicos', name: 'Espacio músicos', selected: false },
    { id: 'espacio_bombas', name: 'Espacio bombas', selected: false },
  ]);

  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);

  // Cargar datos del API al montar
  useEffect(() => {
    if (!eventId) return;
    
    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar evento y catálogos en paralelo
        const [
          eventoData,
          mesasData,
          sillasData,
          mantelesData,
          sobremantelesData,
          coloresData,
          adicionalesData
        ] = await Promise.all([
          eventosApi.obtenerPorId(eventId),
          catalogosApi.tiposMesa.listar(),
          catalogosApi.tiposSilla.listar(),
          catalogosApi.manteles.listar(),
          catalogosApi.sobremanteles.listar(),
          catalogosApi.colores.listar(),
          catalogosApi.tiposAdicional.listar(),
        ]);

        if (cancelled) return;

        setEvento(eventoData);
        setTiposMesa(mesasData);
        setTiposSilla(sillasData);
        setManteles(mantelesData);
        setSobremanteles(sobremantelesData);
        setColores(coloresData);
        setTiposAdicional(adicionalesData);

        const reservaActual = eventoData.reservas.find(r => r.vigente);
        if (!reservaActual) {
          setError('No hay reserva activa para este evento');
          setLoading(false);
          return;
        }

        // Cargar datos relacionados del evento
        const [clienteData, tipoEventoData, salonData] = await Promise.all([
          clientesApi.obtenerPorId(eventoData.clienteId),
          catalogosApi.tiposEvento.obtenerPorId(eventoData.tipoEventoId),
          salonesApi.obtenerPorId(reservaActual.salonId),
        ]);

        if (cancelled) return;
        setCliente(clienteData);
        setTipoEvento(tipoEventoData);
        setSalon(salonData);

        if (cancelled) return;

        setEvento(eventoData);
        
        const mesasActivas = mesasData.filter(m => m.activo);
        const sillasActivas = sillasData.filter(s => s.activo);
        const mantelesActivos = mantelesData.filter(m => m.activo);
        const sobremantelesActivos = sobremantelesData.filter(s => s.activo);
        const coloresActivos = coloresData.filter(c => c.activo);
        const adicionalesActivos = adicionalesData.filter(a => a.activo);

        setTiposMesa(mesasActivas);
        setTiposSilla(sillasActivas);
        setManteles(mantelesActivos);
        setSobremanteles(sobremantelesActivos);
        setColores(coloresActivos);
        setTiposAdicional(adicionalesActivos);

        // Inicializar valores por defecto
        if (mesasActivas.length > 0) setTableType(mesasActivas[0]!.id);
        if (sillasActivas.length > 0) setChairType(sillasActivas[0]!.id);
        if (mantelesActivos.length > 0) setClothType(mantelesActivos[0]!.id);
        if (coloresActivos.length > 0) setClothColor(coloresActivos[0]!.id);
        if (sobremantelesActivos.length > 0) setTopClothType(sobremantelesActivos[0]!.id);
        if (coloresActivos.length > 0) setTopClothColor(coloresActivos[0]!.id);

        // Convertir adicionales a formato del formulario
        const adicionalesFormato: AdditionalItem[] = adicionalesActivos.map(a => ({
          id: `adicional-${a.id}`,
          tipoAdicionalId: a.id,
          name: a.nombre,
          billingType: a.modoCobro,
          selected: false,
          quantity: 1,
          basePrice: Number(a.precioBase),
        }));
        setAdditionalItems(adicionalesFormato);

        // Intentar cargar montaje existente
        const reserva = eventoData.reservas.find(r => r.vigente);
        if (reserva) {
          try {
            const montaje = await montajesApi.obtener(reserva.reservaRaizId);
            if (cancelled) return;

            // Poblar formulario con datos existentes
            if (montaje.mesas.length > 0) {
              const mesa = montaje.mesas[0];
              setTableType(mesa.tipoMesaId);
              setChairType(mesa.tipoSillaId);
              setPeoplePerTable(mesa.sillaPorMesa);
              setTableCount(mesa.cantidadMesas);
              if (mesa.mantelId) setClothType(mesa.mantelId);
              if (mesa.sobremantelId) setTopClothType(mesa.sobremantelId);
              setDinnerware(mesa.vajilla);
              setFajonEnabled(mesa.fajon);
            }

            // Poblar infraestructura
            setInfrastructure([
              { id: 'mesa_ponque', name: 'Mesa ponque', selected: montaje.infraestructura.mesaPonque },
              { id: 'mesa_regalos', name: 'Mesa regalos', selected: montaje.infraestructura.mesaRegalos },
              { id: 'espacio_musicos', name: 'Espacio músicos', selected: montaje.infraestructura.espacioMusicos },
              { id: 'espacio_bombas', name: 'Espacio bombas', selected: montaje.infraestructura.estanteBombas },
            ]);

            // Poblar adicionales seleccionados
            setAdditionalItems(prev => prev.map(item => {
              const adicionalExistente = montaje.adicionales.find(a => a.tipoAdicionalId === item.tipoAdicionalId);
              if (adicionalExistente) {
                return {
                  ...item,
                  selected: true,
                  quantity: adicionalExistente.cantidad,
                };
              }
              return item;
            }));
          } catch (montajeErr) {
            // No hay montaje configurado aún, continuar con valores por defecto
            console.log('No hay montaje configurado aún');
          }
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

  const updateInfrastructureSelection = (itemId: string, checked: boolean) => {
    setInfrastructure((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, selected: checked } : item))
    );
  };

  const updateAdditionalSelection = (itemId: string, checked: boolean) => {
    setAdditionalItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, selected: checked } : item))
    );
  };

  const updateAdditionalQuantity = (itemId: string, quantity: number) => {
    setAdditionalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || item.billingType !== 'POR_UNIDAD') {
          return item;
        }

        return { ...item, quantity: Math.max(1, quantity || 1) };
      })
    );
  };

  // Función para guardar montaje
  const handleGuardarMontaje = async () => {
    if (!evento) {
      setError('No hay evento cargado');
      return;
    }

    const reserva = evento.reservas.find(r => r.vigente);
    if (!reserva) {
      setError('No hay reserva activa para este evento');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await montajesApi.configurar(reserva.reservaRaizId, {
        usuarioId: '00000000-0000-0000-0000-000000000001', // TODO: Usuario autenticado
        observaciones: null,
        mesas: [{
          tipoMesaId: tableType,
          tipoSillaId: chairType,
          sillaPorMesa: peoplePerTable,
          cantidadMesas: tableCount,
          mantelId: clothType || undefined,
          sobremantelId: topClothType || undefined,
          vajilla: dinnerware,
          fajon: fajonEnabled,
        }],
        infraestructura: {
          mesaPonque: infrastructure.find(i => i.id === 'mesa_ponque')?.selected || false,
          mesaRegalos: infrastructure.find(i => i.id === 'mesa_regalos')?.selected || false,
          espacioMusicos: infrastructure.find(i => i.id === 'espacio_musicos')?.selected || false,
          estanteBombas: infrastructure.find(i => i.id === 'espacio_bombas')?.selected || false,
        },
        adicionales: selectedAdditionalItems.map(item => ({
          tipoAdicionalId: item.tipoAdicionalId,
          cantidad: item.quantity,
        })),
      });

      alert('Montaje guardado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar montaje');
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
      totalQuote: '$0',
    };
  }, [evento, cliente, salon, tipoEvento, eventId]);

  const selectedClothColor = useMemo(
    () => colores.find((color) => color.id === clothColor),
    [clothColor, colores]
  );

  const selectedTopClothColor = useMemo(
    () => colores.find((color) => color.id === topClothColor),
    [topClothColor, colores]
  );

  const selectedInfrastructureItems = useMemo(
    () => infrastructure.filter((item) => item.selected),
    [infrastructure]
  );

  const selectedAdditionalItems = useMemo(
    () => additionalItems.filter((item) => item.selected),
    [additionalItems]
  );

  const additionalTotal = useMemo(() => {
    return selectedAdditionalItems.reduce((sum, item) => {
      const lineTotal = item.billingType === 'POR_UNIDAD' ? item.quantity * item.basePrice : item.basePrice;
      return sum + lineTotal;
    }, 0);
  }, [selectedAdditionalItems]);

  if (loading) {
    return (
      <section className="space-y-10 pb-32">
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          Cargando configuración de montaje...
        </div>
      </section>
    );
  }

  if (error && !evento) {
    return (
      <section className="space-y-10 pb-32">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-10 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="montaje" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 mb-24 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-stone-500">Ficha operativa</p>
                <h3 className="font-display text-2xl font-bold text-on-surface mt-1">Montaje del evento</h3>
                <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
                  Configura mesas, sillas, textiles, infraestructura y adicionales. La cotización toma estas
                  cantidades como fuente de verdad.
                </p>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                En edición
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-8 shadow-sm space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-display font-bold text-on-surface">Configuración de mesas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Tipo de mesa</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                    value={tableType}
                    onChange={(eventTarget) => setTableType(eventTarget.target.value)}
                    disabled={tiposMesa.length === 0}
                  >
                    {tiposMesa.length === 0 && <option value="">Cargando...</option>}
                    {tiposMesa.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Tipo de silla</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                    value={chairType}
                    onChange={(eventTarget) => setChairType(eventTarget.target.value)}
                    disabled={tiposSilla.length === 0}
                  >
                    {tiposSilla.length === 0 && <option value="">Cargando...</option>}
                    {tiposSilla.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Personas por mesa</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="number"
                    min={1}
                    value={peoplePerTable}
                    onChange={(eventTarget) => setPeoplePerTable(Number(eventTarget.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Cantidad de mesas</label>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="number"
                    min={1}
                    value={tableCount}
                    onChange={(eventTarget) => setTableCount(Number(eventTarget.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Vajilla</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                    value={dinnerware ? 'true' : 'false'}
                    onChange={(eventTarget) => setDinnerware(eventTarget.target.value === 'true')}
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-2">Fajón</label>
                  <select
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                    value={fajonEnabled ? 'true' : 'false'}
                    onChange={(eventTarget) => setFajonEnabled(eventTarget.target.value === 'true')}
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="md:col-span-3 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
                  <p className="text-sm font-semibold text-on-surface mb-3">Textiles de mesa</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-md border border-outline-variant/30 bg-surface-container-lowest p-3 space-y-3">
                      <label className="block text-xs font-bold text-neutral-700">Mantel</label>
                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={clothType}
                        onChange={(eventTarget) => setClothType(eventTarget.target.value)}
                        disabled={manteles.length === 0}
                      >
                        {manteles.length === 0 && <option value="">Cargando...</option>}
                        {manteles.map((mantel) => (
                          <option key={mantel.id} value={mantel.id}>
                            {mantel.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={clothColor}
                        onChange={(eventTarget) => setClothColor(eventTarget.target.value)}
                        disabled={colores.length === 0}
                      >
                        {colores.length === 0 && <option value="">Cargando...</option>}
                        {colores.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.nombre}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="text-sm">Color: {selectedClothColor?.nombre || 'Sin seleccionar'}</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-outline-variant/30 bg-surface-container-lowest p-3 space-y-3">
                      <label className="block text-xs font-bold text-neutral-700">Sobremantel</label>
                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={topClothType}
                        onChange={(eventTarget) => setTopClothType(eventTarget.target.value)}
                        disabled={sobremanteles.length === 0}
                      >
                        {sobremanteles.length === 0 && <option value="">Cargando...</option>}
                        {sobremanteles.map((sobremantel) => (
                          <option key={sobremantel.id} value={sobremantel.id}>
                            {sobremantel.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={topClothColor}
                        onChange={(eventTarget) => setTopClothColor(eventTarget.target.value)}
                        disabled={colores.length === 0}
                      >
                        {colores.length === 0 && <option value="">Cargando...</option>}
                        {colores.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.nombre}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="text-sm">Color: {selectedTopClothColor?.nombre || 'Sin seleccionar'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-2 border-t border-outline-variant/30">
              <h3 className="text-xl font-display font-bold text-on-surface">Infraestructura</h3>
              <div className="overflow-hidden rounded-lg border border-outline-variant/30">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-5 py-3">Item</th>
                      <th className="px-5 py-3 text-right">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                    {infrastructure.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-3 font-semibold text-on-surface">{item.name}</td>
                        <td className="px-5 py-3 text-right">
                          <input
                            className="w-4 h-4 rounded border-outline-variant text-primary-gold focus:ring-primary-gold"
                            type="checkbox"
                            checked={item.selected}
                            onChange={(eventTarget) =>
                              updateInfrastructureSelection(item.id, eventTarget.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4 pt-2 border-t border-outline-variant/30">
              <h3 className="text-xl font-display font-bold text-on-surface">Adicionales</h3>
              <div className="overflow-hidden rounded-lg border border-outline-variant/30">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-xs uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-5 py-3">Item</th>
                      <th className="px-5 py-3">Cobro</th>
                      <th className="px-5 py-3 text-right">Cantidad</th>
                      <th className="px-5 py-3 text-right">Precio base</th>
                      <th className="px-5 py-3 text-right">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                    {additionalItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-3 font-semibold text-on-surface">{item.name}</td>
                        <td className="px-5 py-3 text-sm text-on-surface-variant">
                          {item.billingType === 'POR_SERVICIO' ? 'Por servicio' : 'Por unidad'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {item.billingType === 'POR_UNIDAD' ? (
                            <input
                              className="w-20 bg-surface-container-low border border-outline-variant/40 rounded-md px-2 py-1.5 text-sm text-right"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(eventTarget) =>
                                updateAdditionalQuantity(item.id, Number(eventTarget.target.value))
                              }
                            />
                          ) : (
                            <span className="text-sm text-on-surface-variant">1 servicio</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right text-sm text-on-surface-variant">
                          {copCurrencyFormatter.format(item.basePrice)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <input
                            className="w-4 h-4 rounded border-outline-variant text-primary-gold focus:ring-primary-gold"
                            type="checkbox"
                            checked={item.selected}
                            onChange={(eventTarget) =>
                              updateAdditionalSelection(item.id, eventTarget.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <aside className="hidden lg:block w-[320px] sticky top-[92px] mt-2 space-y-6">
          <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-primary-gold">Resumen de montaje</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Mesas</span>
                <span className="font-semibold text-on-surface">{tableCount}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Personas por mesa</span>
                <span className="font-semibold text-on-surface">{peoplePerTable}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Tipo mesa / silla</span>
                <span className="font-semibold text-on-surface text-right">
                  {tiposMesa.find(t => t.id === tableType)?.nombre || 'Sin definir'} · {tiposSilla.find(s => s.id === chairType)?.nombre || 'Sin definir'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Mantel</span>
                <span className="font-semibold text-on-surface text-right">
                  {manteles.find(m => m.id === clothType)?.nombre || 'Sin definir'} · {selectedClothColor?.nombre || 'Sin color'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Sobremantel</span>
                <span className="font-semibold text-on-surface text-right">
                  {sobremanteles.find(s => s.id === topClothType)?.nombre || 'Sin definir'} · {selectedTopClothColor?.nombre || 'Sin color'}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Vajilla</span>
                <span className="font-semibold text-on-surface text-right">{dinnerware ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Fajón</span>
                <span className="font-semibold text-on-surface">{fajonEnabled ? 'Sí' : 'No'}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Infraestructura</p>
              {selectedInfrastructureItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm text-on-surface">
                  {selectedInfrastructureItems.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-on-surface-variant">Sin elementos seleccionados</p>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-lg text-on-surface">Adicionales seleccionados</h4>
            {selectedAdditionalItems.length > 0 ? (
              <div className="space-y-3">
                {selectedAdditionalItems.map((item) => {
                  const lineTotal =
                    item.billingType === 'POR_UNIDAD' ? item.quantity * item.basePrice : item.basePrice;

                  return (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-on-surface">{item.name}</p>
                        <p className="text-on-surface-variant text-xs">
                          {item.billingType === 'POR_UNIDAD' ? `${item.quantity} unidades` : '1 servicio'}
                        </p>
                      </div>
                      <p className="font-semibold text-on-surface">
                        {copCurrencyFormatter.format(lineTotal)}
                      </p>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center border-t border-outline-variant/20 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Total adicionales
                  </span>
                  <span className="font-display text-lg font-bold text-primary-gold">
                    {copCurrencyFormatter.format(additionalTotal)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">No hay adicionales seleccionados.</p>
            )}
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-surface-container-lowest/80 backdrop-blur-md border-t border-surface-container px-6 py-4 flex justify-between items-center z-[60]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Cambios de montaje listos para guardar
          </p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none bg-primary-gold text-white rounded-md px-8 py-2.5 text-sm font-bold shadow-sm hover:bg-primary transition-colors disabled:opacity-50"
            type="button"
            onClick={handleGuardarMontaje}
            disabled={saving || !evento}
          >
            {saving ? 'Guardando...' : 'Guardar montaje'}
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMontagePage;

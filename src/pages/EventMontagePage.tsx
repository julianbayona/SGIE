import React, { useEffect, useMemo, useState } from 'react';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import { getEventSummaryById } from '@/features/events/data/eventSummary';
import { useParams } from 'react-router-dom';

interface InfrastructureItem {
  id: string;
  name: string;
  selected: boolean;
}

interface AdditionalItem {
  id: string;
  name: string;
  billingType: 'servicio' | 'unidad';
  selected: boolean;
  quantity: number;
  basePrice: number;
}

interface FabricColor {
  id: string;
  name: string;
  hex: string;
}

const tableTypes = ['Redonda', 'Rectangular', 'Imperial'];
const chairTypes = ['Tiffany', 'Crossback', 'Napoleón'];
const clothTypes = ['Lino premium', 'Algodón clásico', 'Raso ceremonial'];
const topClothTypes = ['Organza', 'Encaje', 'Satinado'];

const clothColorPalette: FabricColor[] = [
  { id: 'marfil-real', name: 'Marfil real', hex: '#EFE4CE' },
  { id: 'blanco-perla', name: 'Blanco perla', hex: '#F4F4EF' },
  { id: 'champana-claro', name: 'Champana claro', hex: '#E9D8B4' },
  { id: 'verde-oliva', name: 'Verde oliva', hex: '#7D8461' },
  { id: 'gris-piedra', name: 'Gris piedra', hex: '#B5B1A8' },
];

const topClothPalette: FabricColor[] = [
  { id: 'dorado-viejo', name: 'Dorado viejo', hex: '#B08A3F' },
  { id: 'champana-satin', name: 'Champana satinado', hex: '#D6B679' },
  { id: 'marfil-suave', name: 'Marfil suave', hex: '#F3E9D3' },
  { id: 'verde-salvia', name: 'Verde salvia', hex: '#95A28A' },
  { id: 'grafito', name: 'Grafito', hex: '#5D6165' },
];

const clothColorByType: Record<string, string[]> = {
  'Lino premium': ['marfil-real', 'blanco-perla', 'gris-piedra'],
  'Algodón clásico': ['blanco-perla', 'champana-claro', 'verde-oliva'],
  'Raso ceremonial': ['champana-claro', 'marfil-real', 'gris-piedra'],
};

const topColorByCloth: Record<string, string[]> = {
  'marfil-real': ['dorado-viejo', 'champana-satin', 'verde-salvia'],
  'blanco-perla': ['dorado-viejo', 'grafito', 'verde-salvia'],
  'champana-claro': ['marfil-suave', 'dorado-viejo', 'grafito'],
  'verde-oliva': ['champana-satin', 'marfil-suave', 'dorado-viejo'],
  'gris-piedra': ['marfil-suave', 'champana-satin', 'dorado-viejo'],
};

const topColorByTopType: Record<string, string[]> = {
  Organza: ['dorado-viejo', 'champana-satin', 'marfil-suave'],
  Encaje: ['marfil-suave', 'verde-salvia', 'champana-satin'],
  Satinado: ['grafito', 'dorado-viejo', 'champana-satin'],
};

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const EventMontagePage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const [tableType, setTableType] = useState('Redonda');
  const [chairType, setChairType] = useState('Tiffany');
  const [peoplePerTable, setPeoplePerTable] = useState(10);
  const [tableCount, setTableCount] = useState(12);
  const [clothType, setClothType] = useState('Lino premium');
  const [clothColor, setClothColor] = useState('marfil-real');
  const [topClothType, setTopClothType] = useState('Organza');
  const [topClothColor, setTopClothColor] = useState('dorado-viejo');
  const [dinnerware, setDinnerware] = useState('Vajilla blanca con ribete dorado');
  const [fajonEnabled, setFajonEnabled] = useState(true);

  const [infrastructure, setInfrastructure] = useState<InfrastructureItem[]>([
    { id: 'mesa_ponque', name: 'Mesa ponque', selected: false },
    { id: 'mesa_regalos', name: 'Mesa regalos', selected: false },
    { id: 'espacio_musicos', name: 'Espacio músicos', selected: false },
    { id: 'espacio_bombas', name: 'Espacio bombas', selected: false },
  ]);

  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([
    {
      id: 'tarimas',
      name: 'Tarimas',
      billingType: 'unidad',
      selected: false,
      quantity: 1,
      basePrice: 180000,
    },
    {
      id: 'audiovisuales',
      name: 'Audiovisuales',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 450000,
    },
    {
      id: 'telas',
      name: 'Telas',
      billingType: 'unidad',
      selected: false,
      quantity: 1,
      basePrice: 120000,
    },
    {
      id: 'luces_arbol',
      name: 'Luces árbol',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 260000,
    },
    {
      id: 'luces_techo',
      name: 'Luces techo',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 300000,
    },
  ]);

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
        if (item.id !== itemId || item.billingType !== 'unidad') {
          return item;
        }

        return { ...item, quantity: Math.max(1, quantity || 1) };
      })
    );
  };

  const selectedClothColor = useMemo(
    () => clothColorPalette.find((color) => color.id === clothColor),
    [clothColor]
  );

  const selectedTopClothColor = useMemo(
    () => topClothPalette.find((color) => color.id === topClothColor),
    [topClothColor]
  );

  const clothColorOptions = useMemo(() => {
    const allowedIds = clothColorByType[clothType] ?? [];

    return allowedIds
      .map((colorId) => clothColorPalette.find((color) => color.id === colorId))
      .filter((color): color is FabricColor => Boolean(color));
  }, [clothType]);

  const topClothOptions = useMemo(() => {
    const allowedByCloth = topColorByCloth[clothColor] ?? [];
    const allowedByTopType = topColorByTopType[topClothType] ?? [];
    const allowedIds = allowedByCloth.filter((id) => allowedByTopType.includes(id));

    return allowedIds
      .map((colorId) => topClothPalette.find((color) => color.id === colorId))
      .filter((color): color is FabricColor => Boolean(color));
  }, [clothColor, topClothType]);

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
      const lineTotal = item.billingType === 'unidad' ? item.quantity * item.basePrice : item.basePrice;
      return sum + lineTotal;
    }, 0);
  }, [selectedAdditionalItems]);

  useEffect(() => {
    const allowedIds = clothColorByType[clothType] ?? [];
    const firstAllowed = allowedIds[0];

    if (firstAllowed && !allowedIds.includes(clothColor)) {
      setClothColor(firstAllowed);
    }
  }, [clothType, clothColor]);

  useEffect(() => {
    const allowedByCloth = topColorByCloth[clothColor] ?? [];
    const allowedByTopType = topColorByTopType[topClothType] ?? [];
    const allowedIds = allowedByCloth.filter((id) => allowedByTopType.includes(id));
    const firstAllowed = allowedIds[0];

    if (firstAllowed && !allowedIds.includes(topClothColor)) {
      setTopClothColor(firstAllowed);
    }
  }, [clothColor, topClothType, topClothColor]);

  return (
    <section className="space-y-10 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="montaje" />

      <div className="lg:flex lg:items-start gap-6">
        <div className="flex-1 mb-24">
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
                  >
                    {tableTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                  >
                    {chairTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm"
                    type="text"
                    value={dinnerware}
                    onChange={(eventTarget) => setDinnerware(eventTarget.target.value)}
                    placeholder="Descripcion de vajilla"
                  />
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
                      >
                        {clothTypes.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={clothColor}
                        onChange={(eventTarget) => setClothColor(eventTarget.target.value)}
                      >
                        {clothColorOptions.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: selectedClothColor?.hex ?? '#FFFFFF' }}
                        ></span>
                        <span>Color actual: {selectedClothColor?.name ?? clothColor}</span>
                      </div>
                    </div>

                    <div className="rounded-md border border-outline-variant/30 bg-surface-container-lowest p-3 space-y-3">
                      <label className="block text-xs font-bold text-neutral-700">Sobremantel</label>
                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={topClothType}
                        onChange={(eventTarget) => setTopClothType(eventTarget.target.value)}
                      >
                        {topClothTypes.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                        value={topClothColor}
                        onChange={(eventTarget) => setTopClothColor(eventTarget.target.value)}
                      >
                        {topClothOptions.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: selectedTopClothColor?.hex ?? '#FFFFFF' }}
                        ></span>
                        <span>Color actual: {selectedTopClothColor?.name ?? topClothColor}</span>
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
                          {item.billingType === 'servicio' ? 'Por servicio' : 'Por unidad'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {item.billingType === 'unidad' ? (
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
                <span className="font-semibold text-on-surface text-right">{tableType} · {chairType}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Mantel</span>
                <span className="font-semibold text-on-surface text-right">
                  {clothType} · {selectedClothColor?.name ?? clothColor}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Sobremantel</span>
                <span className="font-semibold text-on-surface text-right">
                  {topClothType} · {selectedTopClothColor?.name ?? topClothColor}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Vajilla</span>
                <span className="font-semibold text-on-surface text-right">{dinnerware || 'Sin definir'}</span>
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
                    item.billingType === 'unidad' ? item.quantity * item.basePrice : item.basePrice;

                  return (
                    <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <p className="font-semibold text-on-surface">{item.name}</p>
                        <p className="text-on-surface-variant text-xs">
                          {item.billingType === 'unidad' ? `${item.quantity} unidades` : '1 servicio'}
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
            className="flex-1 sm:flex-none bg-primary-gold text-white rounded-md px-8 py-2.5 text-sm font-bold shadow-sm hover:bg-primary transition-colors"
            type="button"
          >
            Guardar montaje
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMontagePage;

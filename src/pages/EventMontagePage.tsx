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
  overridePrice: number;
}

interface FabricColor {
  id: string;
  name: string;
  hex: string;
}

const tableTypes = ['Redonda', 'Rectangular', 'Imperial'];
const chairTypes = ['Tiffany', 'Crossback', 'Napoleon'];
const clothTypes = ['Lino premium', 'Algodon clasico', 'Raso ceremonial'];
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
  'Algodon clasico': ['blanco-perla', 'champana-claro', 'verde-oliva'],
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
    {
      id: 'mesa_ponque',
      name: 'Mesa ponque',
      selected: false,
    },
    {
      id: 'mesa_regalos',
      name: 'Mesa regalos',
      selected: false,
    },
    {
      id: 'espacio_musicos',
      name: 'Espacio musicos',
      selected: false,
    },
    {
      id: 'espacio_bombas',
      name: 'Espacio bombas',
      selected: false,
    },
  ]);

  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([
    {
      id: 'tarimas',
      name: 'Tarimas',
      billingType: 'unidad',
      selected: false,
      quantity: 1,
      basePrice: 180000,
      overridePrice: 180000,
    },
    {
      id: 'audiovisuales',
      name: 'Audiovisuales',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 450000,
      overridePrice: 450000,
    },
    {
      id: 'telas',
      name: 'Telas',
      billingType: 'unidad',
      selected: false,
      quantity: 1,
      basePrice: 120000,
      overridePrice: 120000,
    },
    {
      id: 'luces_arbol',
      name: 'Luces arbol',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 260000,
      overridePrice: 260000,
    },
    {
      id: 'luces_techo',
      name: 'Luces techo',
      billingType: 'servicio',
      selected: false,
      quantity: 1,
      basePrice: 300000,
      overridePrice: 300000,
    },
  ]);

  const updateInfrastructureSelection = (itemId: string, checked: boolean) => {
    setInfrastructure((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          selected: checked,
        };
      })
    );
  };

  const updateAdditionalSelection = (itemId: string, checked: boolean) => {
    setAdditionalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          selected: checked,
        };
      })
    );
  };

  const updateAdditionalQuantity = (itemId: string, quantity: number) => {
    setAdditionalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || item.billingType !== 'unidad') {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(1, quantity || 1),
        };
      })
    );
  };

  const updateAdditionalOverridePrice = (itemId: string, overridePrice: number) => {
    setAdditionalItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          overridePrice: Math.max(0, overridePrice || 0),
        };
      })
    );
  };

  const selectedClothColorName = useMemo(() => {
    const selected = clothColorPalette.find((color) => color.id === clothColor);

    return selected?.name ?? clothColor;
  }, [clothColor]);

  const selectedClothColorHex = useMemo(() => {
    const selected = clothColorPalette.find((color) => color.id === clothColor);

    return selected?.hex ?? '#FFFFFF';
  }, [clothColor]);

  const clothColorOptions = useMemo(() => {
    const allowedIds = clothColorByType[clothType] ?? [];

    return allowedIds.reduce<FabricColor[]>((acc, colorId) => {
      const match = clothColorPalette.find((color) => color.id === colorId);

      if (match) {
        acc.push(match);
      }

      return acc;
    }, []);
  }, [clothType]);

  const topClothSuggestions = useMemo(() => {
    const allowedByCloth = topColorByCloth[clothColor] ?? [];
    const allowedByTopType = topColorByTopType[topClothType] ?? [];
    const allowedIds = allowedByCloth.filter((id) => allowedByTopType.includes(id));

    return allowedIds.reduce<FabricColor[]>((acc, colorId) => {
      const match = topClothPalette.find((color) => color.id === colorId);

      if (match) {
        acc.push(match);
      }

      return acc;
    }, []);
  }, [clothColor]);

  const selectedTopClothColorName = useMemo(() => {
    const selected = topClothPalette.find((color) => color.id === topClothColor);

    return selected?.name ?? topClothColor;
  }, [topClothColor]);

  const selectedTopClothColorHex = useMemo(() => {
    const selected = topClothPalette.find((color) => color.id === topClothColor);

    return selected?.hex ?? '#FFFFFF';
  }, [topClothColor]);

  useEffect(() => {
    const allowedIds = clothColorByType[clothType] ?? [];
    const firstAllowed = allowedIds[0];

    if (firstAllowed && !allowedIds.includes(clothColor)) {
      setClothColor(firstAllowed);
    }
  }, [clothType, clothColor]);

  useEffect(() => {
    const allowedIds = topColorByCloth[clothColor] ?? [];
    const firstAllowed = allowedIds[0];

    if (firstAllowed && !allowedIds.includes(topClothColor)) {
      setTopClothColor(firstAllowed);
    }
  }, [clothColor, topClothColor]);

  return (
    <section className="space-y-10 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="montaje" />

      <div className="bg-surface-container-lowest border border-border rounded-xl p-8 shadow-sm space-y-8">
        <section className="space-y-4">
          <h3 className="text-xl font-display font-bold text-on-surface">Configuracion de mesas</h3>
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
              <label className="block text-xs font-bold text-neutral-700 mb-2">Fajon</label>
              <select
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary-gold"
                value={fajonEnabled ? 'true' : 'false'}
                onChange={(eventTarget) => setFajonEnabled(eventTarget.target.value === 'true')}
              >
                <option value="true">Si</option>
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
                      style={{ backgroundColor: selectedClothColorHex }}
                    ></span>
                    <span>Color actual: {selectedClothColorName}</span>
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
                    {topClothSuggestions.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: selectedTopClothColorHex }}
                    ></span>
                    <span>Color actual: {selectedTopClothColorName}</span>
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
                    <td className="px-5 py-3 font-semibold text-on-surface">
                      {item.name}
                    </td>
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
                  <th className="px-5 py-3 text-right">Precio override</th>
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
                        className="w-28 bg-surface-container-low border border-outline-variant/40 rounded-md px-2 py-1.5 text-sm text-right"
                        type="number"
                        min={0}
                        step={1000}
                        value={item.overridePrice}
                        onChange={(eventTarget) =>
                          updateAdditionalOverridePrice(item.id, Number(eventTarget.target.value))
                        }
                      />
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

      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-surface-container-lowest/80 backdrop-blur-md border-t border-surface-container px-6 py-4 flex justify-between items-center z-[60]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Cambios de montaje listos para guardar</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary-gold text-white px-8 py-2.5 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
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

import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EventDetailHeaderTabs from '@/features/events/components/EventDetailHeaderTabs';
import { getEventSummaryById } from '@/features/events/data/eventSummary';

interface MenuItemOption {
  label: string;
  price: number;
}

interface CourseConfig {
  key: string;
  title: string;
  options: MenuItemOption[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const courseConfigs: CourseConfig[] = [
  {
    key: 'entrada',
    title: 'Entrada',
    options: [
      { label: 'Carpaccio de res con alcaparras', price: 25000 },
      { label: 'Ensalada de frutos del bosque', price: 22000 },
    ],
  },
  {
    key: 'consome',
    title: 'Consomé',
    options: [
      { label: 'Crema de espárragos', price: 8500 },
      { label: 'Consomé de pavo artesanal', price: 9000 },
    ],
  },
  {
    key: 'platoFuerte',
    title: 'Plato fuerte',
    options: [
      { label: 'Medallón de lomo en salsa pimienta', price: 65000 },
      { label: 'Salmón a la parrilla con finas hierbas', price: 68000 },
    ],
  },
  {
    key: 'postre',
    title: 'Postre',
    options: [
      { label: 'Mousse de chocolate al 70%', price: 12000 },
      { label: 'Cheesecake de frutos amarillos', price: 13000 },
    ],
  },
];

const beverageOptions: MenuItemOption[] = [
  { label: 'Jugo natural + Agua', price: 15000 },
  { label: 'Vino de la casa', price: 26000 },
  { label: 'Gaseosas variadas', price: 9000 },
  { label: 'Barra libre nacional', price: 38000 },
];

interface CourseState {
  selectedLabel: string;
  basePrice: number;
  quantity: number;
  notes: string;
}

interface EconomicPreviewLine {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

const createDefaultState = (option: MenuItemOption): CourseState => ({
  selectedLabel: option.label,
  basePrice: option.price,
  quantity: 0,
  notes: '',
});

const EventMenuPage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const [courses, setCourses] = useState<Record<string, CourseState>>(() => {
    const initial: Record<string, CourseState> = {};

    courseConfigs.forEach((course) => {
      initial[course.key] = createDefaultState(course.options[0]!);
    });

    return initial;
  });

  const [beverage, setBeverage] = useState<CourseState>(() => createDefaultState(beverageOptions[0]!));
  const [economicPreviewLines, setEconomicPreviewLines] = useState<EconomicPreviewLine[]>([]);
  const [exceptionsText, setExceptionsText] = useState('');

  const updateCourse = (key: string, updater: (prev: CourseState) => CourseState) => {
    setCourses((prev) => ({
      ...prev,
      [key]: updater(prev[key]!),
    }));
  };

  const addEconomicPreviewLine = (line: Omit<EconomicPreviewLine, 'id'>) => {
    if (line.quantity <= 0) {
      return;
    }

    setEconomicPreviewLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...line,
      },
    ]);
  };

  const totalEstimate = useMemo(() => {
    return economicPreviewLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }, [economicPreviewLines]);

  const subtotalPerPerson = useMemo(() => {
    const guests = event.guests || 0;

    if (guests <= 0) {
      return 0;
    }

    return totalEstimate / guests;
  }, [event.guests, totalEstimate]);

  return (
    <section className="space-y-8 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="menu" />

      <div className="lg:flex lg:items-start max-w-[1400px] mx-auto w-full gap-6">
        <div className="space-y-8 flex-1 mb-32 md:mb-20">
          <div className="bg-surface-container-lowest p-8 shadow-sm space-y-10">
            <h4 className="font-display text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Selección de menú principal</h4>

            {courseConfigs.map((course, index) => {
              const courseState = courses[course.key]!;

              return (
                <div key={course.key} className={`${index < courseConfigs.length - 1 ? 'border-b border-surface-container pb-10' : 'pb-4'} grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-start`}>
                  <div className="lg:col-span-12 mb-2">
                    <label className="text-xs uppercase tracking-wider text-primary-gold font-bold block">{course.title}</label>
                  </div>

                  <div className="lg:col-span-4">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Selección</label>
                    <select
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 px-3 italic"
                      value={courseState.selectedLabel}
                      onChange={(eventTarget) => {
                        const option = course.options.find((item) => item.label === eventTarget.target.value) ?? course.options[0]!;
                        updateCourse(course.key, (prev) => ({
                          ...prev,
                          selectedLabel: option.label,
                          basePrice: option.price,
                        }));
                      }}
                    >
                      {course.options.map((option) => (
                        <option key={option.label} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Cantidad</label>
                    <input
                      className="w-full h-[42px] bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm text-center"
                      type="number"
                      min={0}
                      value={courseState.quantity}
                      onChange={(eventTarget) => {
                        const next = Number(eventTarget.target.value);
                        updateCourse(course.key, (prev) => ({
                          ...prev,
                          quantity: Math.max(0, Number.isNaN(next) ? 0 : next),
                        }));
                      }}
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Especificaciones</label>
                    <input
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 px-3"
                      placeholder="Instrucciones..."
                      type="text"
                      value={courseState.notes}
                      onChange={(eventTarget) => {
                        updateCourse(course.key, (prev) => ({
                          ...prev,
                          notes: eventTarget.target.value,
                        }));
                      }}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Precio base</label>
                    <div className="h-[42px] flex items-center justify-end px-3 bg-surface-container-low text-sm font-bold text-primary-gold">
                      {formatCurrency(courseState.basePrice)}
                    </div>
                  </div>

                  <div className="lg:col-span-1 pt-6">
                    <button
                      className="w-full h-[42px] border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-on-surface flex items-center justify-center gap-1.5"
                      type="button"
                      title="Agregar al resumen"
                      disabled={courseState.quantity <= 0}
                      onClick={() => {
                        addEconomicPreviewLine({
                          product: courseState.selectedLabel,
                          quantity: courseState.quantity,
                          unitPrice: courseState.basePrice,
                          notes: courseState.notes.trim(),
                        });

                        updateCourse(course.key, (prev) => ({
                          ...prev,
                          quantity: 0,
                          notes: '',
                        }));
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary-gold">add_circle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-surface-container-lowest p-8 shadow-sm space-y-6">
            <h4 className="font-display text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Gestión de bebidas</h4>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-start">
              <div className="lg:col-span-5">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Bebida seleccionada</label>
                <select
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 px-3 italic"
                  value={beverage.selectedLabel}
                  onChange={(eventTarget) => {
                    const option = beverageOptions.find((item) => item.label === eventTarget.target.value) ?? beverageOptions[0]!;
                    setBeverage((prev) => ({
                      ...prev,
                      selectedLabel: option.label,
                      basePrice: option.price,
                    }));
                  }}
                >
                  {beverageOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Cantidad</label>
                <input
                  className="w-full h-[42px] bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm text-center"
                  type="number"
                  min={0}
                  value={beverage.quantity}
                  onChange={(eventTarget) => {
                    const next = Number(eventTarget.target.value);
                    setBeverage((prev) => ({
                      ...prev,
                      quantity: Math.max(0, Number.isNaN(next) ? 0 : next),
                    }));
                  }}
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Precio base</label>
                <div className="h-[42px] flex items-center justify-end px-3 bg-surface-container-low text-sm font-bold text-primary-gold">
                  {formatCurrency(beverage.basePrice)}
                </div>
              </div>

              <div className="lg:col-span-3 pt-6">
                <button
                  className="w-full h-[42px] border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-on-surface flex items-center justify-center gap-1.5"
                  type="button"
                  title="Agregar al resumen"
                  disabled={beverage.quantity <= 0}
                  onClick={() => {
                    addEconomicPreviewLine({
                      product: beverage.selectedLabel,
                      quantity: beverage.quantity,
                      unitPrice: beverage.basePrice,
                      notes: beverage.notes.trim(),
                    });

                    setBeverage((prev) => ({
                      ...prev,
                      quantity: 0,
                      notes: '',
                    }));
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary-gold">add_circle</span>
                </button>
              </div>

              <div className="lg:col-span-12">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Especificaciones del servicio de bebidas</label>
                <textarea
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-3 px-3 min-h-[80px]"
                  placeholder="Ej: No servir hielo en el agua, rodajas de limón disponibles..."
                  value={beverage.notes}
                  onChange={(eventTarget) => {
                    setBeverage((prev) => ({
                      ...prev,
                      notes: eventTarget.target.value,
                    }));
                  }}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-8 shadow-sm space-y-4">
              <h4 className="font-display text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Excepciones alimentarias</h4>
              <textarea
                className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-4 px-4 min-h-[120px] italic"
                placeholder="Ej: 3 personas sin gluten, 1 persona alérgica a frutos secos..."
                value={exceptionsText}
                onChange={(eventTarget) => setExceptionsText(eventTarget.target.value)}
              ></textarea>
            </div>

            <div className="bg-primary-gold/5 p-8 shadow-sm border border-primary-gold/20 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">event_note</span>
              </div>
              <h4 className="font-display text-xl font-bold text-primary-gold border-b border-primary-gold/20 pb-2">Agenda y recordatorios</h4>
              <div className="space-y-5 relative z-10">
                <p className="text-sm text-on-surface-variant">
                  Gestiona aquí solo la propuesta gastronómica. Las pruebas de plato y recordatorios de anticipo se programan en la Agenda del evento, donde puedes crear múltiples registros.
                </p>
                <div className="space-y-3">
                  <Link
                    className="w-full bg-primary-gold text-white px-6 py-3 rounded-md text-sm font-bold shadow-sm flex items-center justify-center gap-3 hover:bg-primary transition-colors"
                    to={`/events/${event.id}/agenda`}
                  >
                    <span className="material-symbols-outlined">calendar_add_on</span>
                    Ir a Agenda del evento
                  </Link>
                  <p className="text-[11px] italic text-primary-gold font-medium">
                    Allí podrás registrar varias degustaciones y múltiples recordatorios para cada anticipo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-[320px] sticky top-[92px] mt-2 space-y-6">
          <div className="bg-white p-6 shadow-md border border-neutral-100 rounded-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h5 className="font-display font-bold text-lg text-primary-gold">Resumen económico</h5>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{event.guests} pax</span>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-3">
                <span>Producto</span>
                <span className="text-right">Cantidad</span>
                <span className="text-right">Precio</span>
              </div>

              <div className="space-y-2">
              {economicPreviewLines.length === 0 ? (
                <p className="text-sm text-neutral-400 italic">Aún no hay ítems agregados al resumen.</p>
              ) : (
                economicPreviewLines.map((line) => (
                  <div key={line.id} className="grid grid-cols-[1fr_auto_auto] gap-3 text-sm items-start">
                    <p className="text-neutral-600">{line.product}</p>
                    <span className="text-right text-neutral-500">{line.quantity}</span>
                    <span className="font-medium text-neutral-800 text-right">
                      {formatCurrency(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                ))
              )}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-neutral-100 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total por persona</span>
                <span className="font-display text-xl font-bold text-primary-gold">{formatCurrency(subtotalPerPerson)}</span>
              </div>
              <div className="bg-primary-gold/10 p-4 rounded-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Gran Total</span>
                  <span className="font-display text-2xl font-bold text-primary">{formatCurrency(totalEstimate)}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-surface-container-lowest/80 backdrop-blur-md border-t border-surface-container px-6 py-4 flex justify-between items-center z-[60]">
        <div className="hidden sm:flex items-center gap-2 text-on-secondary-container">
          <span className="material-symbols-outlined text-lg">info</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Resumen en tiempo real basado en la selección actual</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-container-low transition-colors px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2" type="button">
            <span className="material-symbols-outlined text-green-700 text-lg">chat</span>
            Enviar propuesta por WhatsApp
          </button>
          <button className="flex-1 sm:flex-none bg-primary-gold text-white rounded-md px-8 py-2.5 text-sm font-bold shadow-sm hover:bg-primary transition-colors" type="button">
            Guardar menú
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMenuPage;

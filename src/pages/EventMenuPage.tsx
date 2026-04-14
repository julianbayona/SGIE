import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    title: 'Consome',
    options: [
      { label: 'Crema de esparragos', price: 8500 },
      { label: 'Consome de pavo artesanal', price: 9000 },
    ],
  },
  {
    key: 'platoFuerte',
    title: 'Plato Fuerte',
    options: [
      { label: 'Medallon de lomo en salsa pimienta', price: 65000 },
      { label: 'Salmon a la parrilla con finas hierbas', price: 68000 },
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
  overridePrice: number;
  autoQuantity: boolean;
  quantity: number;
  notes: string;
}

const createDefaultState = (option: MenuItemOption, guests: number): CourseState => ({
  selectedLabel: option.label,
  basePrice: option.price,
  overridePrice: option.price,
  autoQuantity: true,
  quantity: guests,
  notes: '',
});

const EventMenuPage: React.FC = () => {
  const { eventId } = useParams();
  const event = useMemo(() => getEventSummaryById(eventId), [eventId]);

  const [courses, setCourses] = useState<Record<string, CourseState>>(() => {
    const initial: Record<string, CourseState> = {};

    courseConfigs.forEach((course) => {
      initial[course.key] = createDefaultState(course.options[0]!, event.guests || 120);
    });

    return initial;
  });

  const [beverage, setBeverage] = useState<CourseState>(() => createDefaultState(beverageOptions[0]!, event.guests || 120));
  const [exceptionsText, setExceptionsText] = useState('');
  const [tastingDateTime, setTastingDateTime] = useState('');

  const updateCourse = (key: string, updater: (prev: CourseState) => CourseState) => {
    setCourses((prev) => ({
      ...prev,
      [key]: updater(prev[key]!),
    }));
  };

  const subtotalPerPerson = useMemo(() => {
    const courseTotal = Object.values(courses).reduce((acc, course) => acc + course.overridePrice, 0);

    return courseTotal + beverage.overridePrice;
  }, [courses, beverage.overridePrice]);

  const totalEstimate = useMemo(() => {
    const guests = event.guests || 0;

    return subtotalPerPerson * guests;
  }, [event.guests, subtotalPerPerson]);

  return (
    <section className="space-y-8 pb-32">
      <EventDetailHeaderTabs event={event} activeTab="menu" />

      <div className="lg:flex lg:items-start max-w-[1400px] mx-auto w-full gap-6">
        <div className="space-y-8 flex-1 mb-32 md:mb-20">
          <div className="bg-surface-container-lowest p-8 shadow-sm space-y-10">
            <h4 className="font-display text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Seleccion de Menu Principal</h4>

            {courseConfigs.map((course, index) => {
              const courseState = courses[course.key]!;

              return (
                <div key={course.key} className={`${index < courseConfigs.length - 1 ? 'border-b border-surface-container pb-10' : 'pb-4'} grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-start`}>
                  <div className="lg:col-span-12 mb-2">
                    <label className="text-xs uppercase tracking-wider text-primary-gold font-bold block">{course.title}</label>
                  </div>

                  <div className="lg:col-span-4">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Seleccion</label>
                    <select
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 px-3 italic"
                      value={courseState.selectedLabel}
                      onChange={(eventTarget) => {
                        const option = course.options.find((item) => item.label === eventTarget.target.value) ?? course.options[0]!;
                        updateCourse(course.key, (prev) => ({
                          ...prev,
                          selectedLabel: option.label,
                          basePrice: option.price,
                          overridePrice: option.price,
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

                  <div className="lg:col-span-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Precio Override</label>
                        <span className="text-[9px] font-medium text-neutral-400">Base: {formatCurrency(courseState.basePrice)}</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                        <input
                          className={`w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 pl-7 pr-3 ${courseState.overridePrice !== courseState.basePrice ? 'border-b-2 border-primary-gold' : ''}`}
                          type="number"
                          min={0}
                          value={courseState.overridePrice}
                          onChange={(eventTarget) => {
                            const next = Number(eventTarget.target.value);
                            updateCourse(course.key, (prev) => ({
                              ...prev,
                              overridePrice: Number.isNaN(next) ? 0 : next,
                            }));
                          }}
                        />
                      </div>
                      {courseState.overridePrice !== courseState.basePrice ? (
                        <div className="flex items-center gap-1 opacity-80">
                          <span className="material-symbols-outlined text-[12px] text-primary-gold">edit</span>
                          <span className="text-[9px] text-primary-gold font-medium italic">Modificado manualmente</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-2">Cantidad</label>
                    <div className="flex items-center gap-3 h-[42px]">
                      <div className="flex items-center gap-2">
                        <input
                          className="w-4 h-4 border-2 border-outline-variant text-primary-gold focus:ring-primary-gold rounded-sm"
                          type="checkbox"
                          checked={courseState.autoQuantity}
                          onChange={(eventTarget) => {
                            updateCourse(course.key, (prev) => ({
                              ...prev,
                              autoQuantity: eventTarget.target.checked,
                            }));
                          }}
                        />
                        <label className="text-[11px] font-medium leading-none">Auto ({event.guests})</label>
                      </div>
                      <input
                        className={`w-16 border-none text-sm py-2 px-2 text-center ${courseState.autoQuantity ? 'bg-neutral-100 opacity-50' : 'bg-surface-container-low'}`}
                        type="number"
                        min={0}
                        value={courseState.autoQuantity ? event.guests : courseState.quantity}
                        onChange={(eventTarget) => {
                          const next = Number(eventTarget.target.value);
                          updateCourse(course.key, (prev) => ({
                            ...prev,
                            quantity: Number.isNaN(next) ? 0 : next,
                          }));
                        }}
                        disabled={courseState.autoQuantity}
                      />
                    </div>
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
                </div>
              );
            })}
          </div>

          <div className="bg-surface-container-lowest p-8 shadow-sm space-y-6">
            <h4 className="font-display text-xl font-bold text-on-surface border-b border-outline-variant pb-2">Gestion de Bebidas</h4>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8 items-start">
              <div className="lg:col-span-4">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Bebida Seleccionada</label>
                <select
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 px-3 italic"
                  value={beverage.selectedLabel}
                  onChange={(eventTarget) => {
                    const option = beverageOptions.find((item) => item.label === eventTarget.target.value) ?? beverageOptions[0]!;
                    setBeverage((prev) => ({
                      ...prev,
                      selectedLabel: option.label,
                      basePrice: option.price,
                      overridePrice: option.price,
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

              <div className="lg:col-span-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Precio Override</label>
                    <span className="text-[9px] font-medium text-neutral-400">Base: {formatCurrency(beverage.basePrice)}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                    <input
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-2.5 pl-7 pr-3"
                      type="number"
                      min={0}
                      value={beverage.overridePrice}
                      onChange={(eventTarget) => {
                        const next = Number(eventTarget.target.value);
                        setBeverage((prev) => ({
                          ...prev,
                          overridePrice: Number.isNaN(next) ? 0 : next,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Cantidad</label>
                <div className="flex items-center gap-3 h-[42px]">
                  <div className="flex items-center gap-2">
                    <input
                      className="w-4 h-4 border-2 border-outline-variant text-primary-gold focus:ring-primary-gold rounded-sm"
                      type="checkbox"
                      checked={beverage.autoQuantity}
                      onChange={(eventTarget) => {
                        setBeverage((prev) => ({
                          ...prev,
                          autoQuantity: eventTarget.target.checked,
                        }));
                      }}
                    />
                    <label className="text-[11px] font-medium leading-none">Auto ({event.guests})</label>
                  </div>
                  <input
                    className={`w-16 border-none text-sm py-2 px-2 text-center ${beverage.autoQuantity ? 'bg-neutral-100 opacity-50' : 'bg-surface-container-low'}`}
                    type="number"
                    min={0}
                    value={beverage.autoQuantity ? event.guests : beverage.quantity}
                    onChange={(eventTarget) => {
                      const next = Number(eventTarget.target.value);
                      setBeverage((prev) => ({
                        ...prev,
                        quantity: Number.isNaN(next) ? 0 : next,
                      }));
                    }}
                    disabled={beverage.autoQuantity}
                  />
                </div>
              </div>

              <div className="lg:col-span-12">
                <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-2">Especificaciones del Servicio de Bebidas</label>
                <textarea
                  className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary-gold/50 text-sm py-3 px-3 min-h-[80px]"
                  placeholder="Ej: No servir hielo en el agua, rodajas de limon disponibles..."
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
                placeholder="Ej: 3 personas sin gluten, 1 persona alergica a frutos secos..."
                value={exceptionsText}
                onChange={(eventTarget) => setExceptionsText(eventTarget.target.value)}
              ></textarea>
            </div>

            <div className="bg-primary-gold/5 p-8 shadow-sm border border-primary-gold/20 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">restaurant</span>
              </div>
              <h4 className="font-display text-xl font-bold text-primary-gold border-b border-primary-gold/20 pb-2">Prueba de plato (opcional)</h4>
              <div className="space-y-5 relative z-10">
                <p className="text-sm text-on-surface-variant">Agende una sesion de degustacion para cerrar detalles del menu antes del evento.</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Fecha y hora sugerida</label>
                    <input
                      className="w-full bg-white border border-primary-gold/20 focus:ring-2 focus:ring-primary-gold/30 rounded-sm text-sm py-3 px-4"
                      type="datetime-local"
                      value={tastingDateTime}
                      onChange={(eventTarget) => setTastingDateTime(eventTarget.target.value)}
                    />
                  </div>
                  <button className="w-full bg-gradient-to-r from-primary to-primary-gold text-white px-6 py-3 text-sm font-bold shadow-md flex items-center justify-center gap-3" type="button">
                    <span className="material-symbols-outlined">calendar_add_on</span>
                    Agendar en calendario
                  </button>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <span className="material-symbols-outlined text-primary-gold text-sm">info</span>
                  <span className="text-[11px] italic text-primary-gold font-medium">Se enviara una invitacion a los organizadores</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block w-[320px] sticky top-[92px] mt-2 space-y-6">
          <div className="bg-white p-6 shadow-md border border-neutral-100 rounded-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
              <h5 className="font-display font-bold text-lg text-primary-gold">Resumen Economico</h5>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">{event.guests} pax</span>
            </div>

            <div className="space-y-3 mb-6">
              {courseConfigs.map((course) => {
                const courseState = courses[course.key]!;
                const isOverride = courseState.overridePrice !== courseState.basePrice;

                return (
                  <div key={course.key} className={`flex justify-between text-sm ${isOverride ? '' : 'text-neutral-400 italic'}`}>
                    <span className={isOverride ? 'text-neutral-500' : ''}>
                      {course.title} {isOverride ? '(Override)' : '(Base)'}
                    </span>
                    <span className="font-medium text-neutral-800">{formatCurrency(courseState.overridePrice)}</span>
                  </div>
                );
              })}

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Bebidas</span>
                <span className="font-medium text-neutral-800">{formatCurrency(beverage.overridePrice)}</span>
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
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Resumen en tiempo real basado en seleccion actual</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-container-low transition-colors px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2" type="button">
            <span className="material-symbols-outlined text-green-700 text-lg">chat</span>
            Enviar propuesta por WhatsApp
          </button>
          <button className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary-gold text-white px-8 py-2.5 text-sm font-bold shadow-lg hover:opacity-90 transition-opacity" type="button">
            Guardar menu
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventMenuPage;

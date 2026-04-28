import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VenueStatus = 'Disponible' | 'Parcial';

interface Venue {
  id: string;
  name: string;
  capacity: string;
  features: string;
  status: VenueStatus;
  pendingText?: string;
}

const venues: Venue[] = [
  {
    id: 'jade',
    name: 'Salón Jade',
    capacity: 'Hasta 120 personas',
    features: 'Ambiente señorial, montaje social o corporativo.',
    status: 'Parcial',
    pendingText: '2 cotizaciones pendientes en el mismo rango',
  },
  {
    id: 'versalles',
    name: 'Versalles',
    capacity: 'Hasta 220 personas',
    features: 'Salón principal para bodas, grados y eventos amplios.',
    status: 'Parcial',
    pendingText: '1 cotización pendiente por confirmar',
  },
  {
    id: 'terraza',
    name: 'Terraza Mirador',
    capacity: 'Hasta 80 personas',
    features: 'Espacio abierto para almuerzos, onces y eventos sociales.',
    status: 'Disponible',
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca',
    capacity: 'Hasta 35 personas',
    features: 'Espacio reservado para reuniones pequeñas.',
    status: 'Disponible',
  },
];

const labelClass =
  'block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2';

const inputClass =
  'w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-2.5 text-sm rounded-md shadow-sm focus:border-primary-gold focus:ring-1 focus:ring-primary-gold/20';

const EventRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('versalles');

  const matchedCustomer = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();

    if (query.includes('mauricio') || query.includes('alarcon')) {
      return {
        name: 'Mauricio Alejandro de Alarcón',
        type: 'Socio',
      };
    }

    return null;
  }, [customerQuery]);

  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);

  return (
    <section className="space-y-8 pb-36">
      <div>
        <p className="text-primary-gold tracking-widest text-xs uppercase mb-2">Solicitud de evento</p>
        <h1 className="text-2xl font-display font-bold text-on-surface">Crear solicitud de evento</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Registra cliente, horario y salón antes de completar menú, montaje y cotización.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <section className="bg-surface-container-low p-6 rounded-lg border border-border">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="text-lg font-display font-bold text-on-surface">Cliente</h2>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <div className="space-y-5">
              <div className="w-full max-w-2xl">
                <label className={labelClass}>Búsqueda de socio / cliente</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-gold text-sm">
                    person_search
                  </span>
                  <input
                    className={`${inputClass} pl-10`}
                    placeholder="Buscar por nombre, cédula o teléfono"
                    type="text"
                    value={customerQuery}
                    onChange={(event) => setCustomerQuery(event.target.value)}
                  />
                </div>
              </div>

              {matchedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-primary-gold/10 border border-primary-gold/30 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-gold">person</span>
                    <div>
                      <p className="font-semibold text-on-surface">{matchedCustomer.name}</p>
                      <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 bg-primary-gold text-white rounded-full">
                        {matchedCustomer.type}
                      </span>
                    </div>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary-gold transition-colors" type="button">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-2 text-primary-gold font-bold text-sm hover:underline transition-all group"
                >
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                    add_circle
                  </span>
                  Registrar nuevo cliente
                </button>
              )}
            </div>
          </section>

          <section className="bg-surface-container-low p-6 rounded-lg border border-border">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="text-lg font-display font-bold text-on-surface">Detalles del evento</h2>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <div>
                <label className={labelClass}>Fecha</label>
                <input className={inputClass} type="date" />
              </div>

              <div>
                <label className={labelClass}>Hora de inicio</label>
                <input className={inputClass} type="time" />
              </div>

              <div>
                <label className={labelClass}>Duración</label>
                <select className={inputClass}>
                  <option>2 horas</option>
                  <option>3 horas</option>
                  <option>4 horas</option>
                  <option>5 horas</option>
                  <option>6 horas</option>
                  <option>7 horas</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Número de personas</label>
                <input className={inputClass} placeholder="0" type="number" min={1} />
              </div>

              <div>
                <label className={labelClass}>Tipo de evento</label>
                <select className={inputClass}>
                  <option>Boda</option>
                  <option>Cumpleaños</option>
                  <option>Bautizo</option>
                  <option>Grado</option>
                  <option>Evento corporativo</option>
                  <option>Otro evento social</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Tipo de comida</label>
                <select className={inputClass}>
                  <option>Desayuno</option>
                  <option>Almuerzo</option>
                  <option>Cena</option>
                  <option>Onces</option>
                  <option>Coctel / pasabocas</option>
                  <option>Sin servicio de comida</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-6 rounded-lg border border-border">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="text-lg font-display font-bold text-on-surface">Selección de salón</h2>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {venues.map((venue) => {
                const isSelected = selectedVenueId === venue.id;
                const isPartial = venue.status === 'Parcial';

                return (
                  <button
                    key={venue.id}
                    type="button"
                    onClick={() => setSelectedVenueId(venue.id)}
                    className={`relative p-4 text-left rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-gold-bg border-gold shadow-sm'
                        : 'bg-surface-container-lowest border-border hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-on-surface">{venue.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-1">{venue.capacity}</p>
                        <p className="text-xs text-on-surface-variant mt-2 leading-snug">{venue.features}</p>
                      </div>
                      {isSelected ? (
                        <span className="material-symbols-outlined text-primary-gold">check_circle</span>
                      ) : null}
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${
                          isPartial ? 'bg-gold-bg2 text-gold-d' : 'bg-green-bg text-green-text'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isPartial ? 'bg-gold' : 'bg-green'}`}></span>
                        {venue.status}
                      </span>

                      {venue.pendingText ? (
                        <p className="text-[11px] text-on-surface-variant mt-2">{venue.pendingText}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="bg-surface-container-lowest border border-border rounded-lg p-5 h-fit sticky top-24 space-y-4">
          <h3 className="font-display font-bold text-lg text-on-surface">Resumen de solicitud</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-text3 font-bold">Cliente</p>
              <p className="font-semibold text-text1">{matchedCustomer?.name ?? 'Sin cliente seleccionado'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-text3 font-bold">Salón</p>
              <p className="font-semibold text-text1">{selectedVenue?.name}</p>
              <p className="text-xs text-text3">{selectedVenue?.capacity}</p>
            </div>
            {selectedVenue?.status === 'Parcial' ? (
              <div className="rounded-md border border-gold/25 bg-gold-bg p-3 text-xs text-gold-d">
                Hay cotizaciones superpuestas. Se permite crear la solicitud, pero debe advertirse al confirmar.
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md border-t border-outline-variant/30 py-4 px-8 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="text-sm font-bold text-on-surface hover:bg-hover bg-[#f5f2ed] border border-outline-variant px-5 py-2.5 rounded-md transition-all flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">close</span>
          Cancelar
        </button>

        <div className="flex items-center gap-4">
          <p className="text-xs text-on-surface-variant max-w-[260px] text-right leading-tight">
            Se creará el evento en estado Pendiente para continuar con menú y cotización.
          </p>
          <button
            type="button"
            onClick={() => navigate('/events/EVT-041/menu')}
            className="bg-primary-gold text-white px-6 py-3 rounded-md font-bold flex items-center gap-3 hover:bg-primary transition-all shadow-sm active:scale-95"
          >
            Crear evento y continuar
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </footer>
    </section>
  );
};

export default EventRequestPage;

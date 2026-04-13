import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VenueStatus = 'Disponible' | 'Parcial';

interface Venue {
  id: string;
  name: string;
  description: string;
  status: VenueStatus;
  pendingText?: string;
  image: string;
}

const venues: Venue[] = [
  {
    id: 'jade',
    name: 'Salon Jade',
    description: 'Ambiente senorial con acabados en marmol.',
    status: 'Parcial',
    pendingText: '2 eventos pendientes por confirmar',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVCDtfd-K8nw7ygwy_MbhMgOfwIBbc9Dkw34Tc6AsB4Rv7NFtlkYBRffYpIpfNb2PgANL7d0WGiFP4aPCYoaCvmlc3DKLBZniQ_bIAyH6PwDFvZLqH2FYIU-5E-s9szEhVnZjPqQvhMf35lcux12g90eH-RRTtmcs42v6sVlzntBmWyzkRPN915gIIgN3EnJ0niZZ_n9p5yQrLc4VKvDrjftILyaEVSjx7wkr9wM0eUlbXiLdQmeIDpsCqPPjd9KVzalOZZgP7l28',
  },
  {
    id: 'versalles',
    name: 'Versalles',
    description: 'Estilo clasico frances con iluminacion natural.',
    status: 'Parcial',
    pendingText: '1 evento pendiente por confirmar',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBe_wM7RQKcxVSOeaPXhR2Lk1hnv5rs6F_ydUQHWGKRH05HiZIvGJsdv5lznT7hghlN5PpxU5gj9lz30Cu2NVvZPIi7rbJeXAZHKjNNM6roNMpgkTl4e85Zq5Vck1DPD96XHd0PZ08Pwn7LfIdS1J9R1D9WpAij7jsKcnuVztNhAEaFv_RR_WZ1PT0_vX7EWA2Fi_yZtzHVV9F7XgVpW72HO7cow3DXjW7I1EW_LQXFyLGcXyJbATg5OaJ5pmZMYQACslArgizH7mI',
  },
  {
    id: 'terraza',
    name: 'Terraza',
    description: 'Espacio al aire libre con vista panoramica.',
    status: 'Disponible',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlhkbo3iRv6XLLtTGMWEJQGM-yxca-BoZ0mwIcCjKwIwUsQWuyxKE7uMATiUInpQ9gxNiqPurAOiBLi0kaFgenTH_QSW8SamTsT5Qej12gWKkVYau7a2hviscogWWFXlqAFUym5zvy88Mc38ejZqd0Aq66MxHOtr1Rr8GPvY3bCiCGYEtWsUlP8ByJYQzEK4e52wzFHfjeSoyUUdg8H9z_Uj-FFFpYLlpx_cVdOYcvyB6IiNNCFbB-RFhH5aSo2XyFGeVCjCqIx60',
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca',
    description: 'Privacidad absoluta rodeada de historia.',
    status: 'Disponible',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCx4tke91bXcbIlUMqsoj7YzpxR8GfQJ3YTlABYPJkqjtg5kVG6eXs8GtpHoe1eluVYv75BZFw2Tl-VyfRMVdqTJVv2aU48yiijsD03c4Nge-Ea7ARTkSK59euo18-ySCL-Vc12ybL4yYCZtT0Rg7sEJtAayDu3cuxqbkzW-p9WBScwBK-m1ulNEoSG2V1ulqJM0XD7Ch-YUQJlH8twtl4zMiInHssz4l6eZOhekHR5R4oWng0EQrgz4C4XlaDiPMwv7Jvr35PCP9o',
  },
];

const labelClass =
  'block text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2';

const EventRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('versalles');

  const matchedCustomer = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();

    if (query.includes('mauricio') || query.includes('alarcon')) {
      return {
        name: 'Mauricio Alejandro de Alarcon',
        type: 'Socio',
      };
    }

    return null;
  }, [customerQuery]);

  return (
    <section className="space-y-12 pb-40">
      <div>
        <p className="text-primary-gold tracking-widest text-xs uppercase mb-2">Solicitud de Registro</p>
        <h1 className="text-4xl font-display italic text-on-surface">Crear Solicitud de Evento</h1>
      </div>

      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-2xl font-display text-on-surface">Informacion del Cliente</h2>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-lg">
          <div className="space-y-6">
            <div className="w-full max-w-2xl">
              <label className={labelClass}>Busqueda de Socio / Cliente</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-gold text-sm">
                  person_search
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary-gold focus:border-primary-gold transition-all rounded-sm shadow-sm"
                  placeholder="Buscar cliente (nombre o cedula)"
                  type="text"
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                />
              </div>
            </div>

            {matchedCustomer ? (
              <div className="flex items-center justify-between p-4 bg-primary-gold/10 border border-primary-gold/30 rounded-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-gold">person</span>
                  <div>
                    <p className="font-display text-lg text-on-surface">{matchedCustomer.name}</p>
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
                Registrar Nuevo Cliente
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-2xl font-display text-on-surface">Detalles del Evento</h2>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className={labelClass}>Fecha</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm" type="date" />
            </div>

            <div>
              <label className={labelClass}>Hora</label>
              <input className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm" type="time" />
            </div>

            <div>
              <label className={labelClass}>Duracion</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm">
                <option>2 Horas</option>
                <option>4 Horas</option>
                <option>6 Horas</option>
                <option>Jornada Completa</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Numero de Asistentes</label>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm"
                placeholder="0"
                type="number"
              />
            </div>

            <div>
              <label className={labelClass}>Tipo de Evento</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm">
                <option>Ceremonia Social</option>
                <option>Conferencia Corporativa</option>
                <option>Gala de Beneficencia</option>
                <option>Almuerzo Privado</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipo de Comida</label>
              <select className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 text-sm rounded-sm shadow-sm">
                <option>Sin Servicio</option>
                <option>Buffet Internacional</option>
                <option>Banquete de Pasos</option>
                <option>Coctel / Pasabocas</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline gap-4 mb-6">
          <h2 className="text-2xl font-display text-on-surface">Seleccion de Salon</h2>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {venues.map((venue) => {
            const isSelected = selectedVenueId === venue.id;
            const isPartial = venue.status === 'Parcial';

            return (
              <button
                key={venue.id}
                type="button"
                onClick={() => setSelectedVenueId(venue.id)}
                className={`group relative p-4 flex gap-4 transition-all duration-300 text-left shadow-sm ${
                  isSelected
                    ? 'bg-[#fdf9f0] border-4 border-[#c29d4d]'
                    : 'bg-surface-container-lowest border-2 border-transparent hover:border-primary-container'
                }`}
              >
                <div className="w-24 h-24 flex-shrink-0 bg-surface-container overflow-hidden rounded-sm">
                  <img
                    alt={venue.name}
                    className={`w-full h-full object-cover transition-all ${
                      isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'
                    }`}
                    src={venue.image}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-display mb-1 text-on-surface">{venue.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-3">{venue.description}</p>

                  <span
                    className={`text-xs mt-1 font-semibold flex items-center gap-1 ${
                      isPartial ? 'text-amber-600' : 'text-green-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPartial ? 'bg-amber-600' : 'bg-green-700'}`}></span>
                    {venue.status}
                  </span>

                  {venue.pendingText ? (
                    <p className="text-[10px] text-on-surface-variant mt-1">{venue.pendingText}</p>
                  ) : null}
                </div>

                <div className={`absolute top-4 right-4 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-[#c29d4d]' : 'text-primary-gold'}`}>
                    check_circle
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-white/90 backdrop-blur-md border-t border-outline-variant/30 py-6 px-10 flex items-center justify-between z-30">
        <button
          type="button"
          onClick={() => navigate('/events')}
          className="text-sm font-bold text-on-surface hover:text-error hover:bg-error/10 bg-[#f5f2ed] border-2 border-outline-variant px-8 py-3.5 rounded-sm transition-all flex items-center gap-2 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">close</span>
          Cancelar Registro
        </button>

        <div className="flex items-center gap-4">
          <p className="text-xs text-on-surface-variant italic max-w-[220px] text-right leading-tight mr-2">
            Se creara el evento y podras completar los detalles despues
          </p>
          <button
            type="button"
            onClick={() => navigate('/events/EVT-041')}
            className="bg-primary-gold text-white px-8 py-4 rounded-sm font-bold flex items-center gap-3 hover:bg-primary transition-all shadow-lg active:scale-95"
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

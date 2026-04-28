import { Event } from '@/features/calendar/types';
import { addHours, subDays } from 'date-fns';

// Mock data para simular la respuesta del backend.
const allEvents: Event[] = [
  {
    id: '1',
    title: 'Boda - Familia Pérez',
    start: new Date(),
    end: addHours(new Date(), 2),
    status: 'Confirmado',
    salon: 'Salón Jade',
  },
  {
    id: '2',
    title: 'Reunión Directiva',
    start: addHours(new Date(), 3),
    end: addHours(new Date(), 4),
    status: 'Pendiente',
    salon: 'Sala de Juntas',
  },
  {
    id: '3',
    title: 'Almuerzo de negocios',
    start: subDays(new Date(), 1),
    end: addHours(subDays(new Date(), 1), 2),
    status: 'Cotización enviada',
    salon: 'Restaurante',
  },
  {
    id: '4',
    title: 'Cumpleaños - Sr. Rodríguez',
    start: addHours(subDays(new Date(), 2), 5),
    end: addHours(subDays(new Date(), 2), 8),
    status: 'Pendiente anticipo',
    salon: 'Versalles',
  },
];

const eventService = {
  async getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    console.log(`Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const filteredEvents = allEvents.filter((event) => {
      return event.start >= startDate && event.start <= endDate;
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    return filteredEvents;
  },
};

export default eventService;

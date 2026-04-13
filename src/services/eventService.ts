import axios from 'axios';
import { Event } from '@/features/calendar/types';
import { addHours, subDays } from 'date-fns';

const API_URL = 'http://localhost:3001/api'; // Esto debería estar en una variable de entorno

// Mock data para simular la respuesta del backend
const allEvents: Event[] = [
    { id: '1', title: 'Boda - Familia Pérez', start: new Date(), end: addHours(new Date(), 2), status: 'Confirmado', salon: 'Salón Jade' },
    { id: '2', title: 'Reunión Directiva', start: addHours(new Date(), 3), end: addHours(new Date(), 4), status: 'Pendiente', salon: 'Sala de Juntas' },
    { id: '3', title: 'Almuerzo de negocios', start: subDays(new Date(), 1), end: addHours(subDays(new Date(), 1), 2), status: 'Cotización enviada', salon: 'Restaurante' },
    { id: '4', title: 'Cumpleaños - Sr. Rodriguez', start: addHours(subDays(new Date(), 2), 5), end: addHours(subDays(new Date(), 2), 8), status: 'Pendiente anticipo', salon: 'Versalles' },
];


const eventService = {
  async getEvents(startDate: Date, endDate: Date): Promise<Event[]> {
    console.log(`Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // En un caso real, aquí se haría la llamada a axios.
    // const response = await axios.get(`${API_URL}/events`, {
    //   params: {
    //     startDate: startDate.toISOString(),
    //     endDate: endDate.toISOString(),
    //   },
    // });
    // return response.data.map((event: any) => ({ ...event, start: new Date(event.start), end: new Date(event.end) }));

    // Simulamos el filtro del backend
    const filteredEvents = allEvents.filter(event => {
        return event.start >= startDate && event.start <= endDate;
    });

    // Simulamos la latencia de la red
    await new Promise(resolve => setTimeout(resolve, 500));

    return filteredEvents;
  },
};

export default eventService;

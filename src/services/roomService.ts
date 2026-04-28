import { Room } from '@/features/availability/types';

const roomService = {
  async getRoomAvailability(date: Date): Promise<Room[]> {
    date.toISOString();

    const mockRooms: Room[] = [
      { id: '1', name: 'Salón Jade', status: 'Libre' },
      { id: '2', name: 'Versalles', status: 'Parcial' },
      { id: '3', name: 'Cancha 1-4', status: 'Libre' },
      { id: '4', name: 'Caldera Central', status: 'Ocupado' },
    ];

    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockRooms;
  },
};

export default roomService;

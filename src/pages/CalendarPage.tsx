import React from 'react';
import CalendarView from '@/features/calendar/components/CalendarView';
import AvailabilityPanel from '@/features/availability/components/AvailabilityPanel';
import { Button } from '@/components/ui/Button';

const CalendarPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif-italic text-primary-gold">Dashboard Principal</h1>
          <p className="text-on-surface-variant font-medium text-xs mt-1 uppercase tracking-widest opacity-80 capitalize">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button>
          <span className="material-symbols-outlined text-base mr-2">add_circle</span>
          Crear Solicitud
        </Button>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        <CalendarView />
        <AvailabilityPanel />
      </div>
    </>
  );
};

export default CalendarPage;

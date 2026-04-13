import React from 'react';
import { useCalendarStore } from '@/store/calendarStore';
import CalendarHeader from '../CalendarHeader';
import MonthView from '../MonthView';
import WeekView from '../WeekView';
import DayView from '../DayView';

const CalendarView: React.FC = () => {
  const { view } = useCalendarStore();

  const renderView = () => {
    switch (view) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <CalendarHeader />
      <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
        {renderView()}
      </div>
      {/* Aquí podría ir el CalendarLegend si se decide hacerlo un componente separado */}
    </div>
  );
};

export default CalendarView;

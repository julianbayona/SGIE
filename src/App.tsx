import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';
import ClientsPage from './pages/ClientsPage';
import EventsPage from './pages/EventsPage';
import QuotesPage from './pages/QuotesPage';
import EventRequestPage from './pages/EventRequestPage';
import EventSummaryPage from './pages/EventSummaryPage';
import EventMenuPage from './pages/EventMenuPage';
import EventSectionPlaceholderPage from './pages/EventSectionPlaceholderPage';
import EventMontagePage from './pages/EventMontagePage';
import EventQuotePage from './pages/EventQuotePage';
import EventPaymentsPage from './pages/EventPaymentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CalendarPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/request" element={<EventRequestPage />} />
          <Route path="events/:eventId" element={<EventSummaryPage />} />
          <Route path="events/:eventId/menu" element={<EventMenuPage />} />
          <Route path="events/:eventId/montaje" element={<EventMontagePage />} />
          <Route path="events/:eventId/cotizacion" element={<EventQuotePage />} />
          <Route path="events/:eventId/pagos" element={<EventPaymentsPage />} />
          <Route path="events/:eventId/:section" element={<EventSectionPlaceholderPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

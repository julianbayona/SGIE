import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';
import ClientsPage from './pages/ClientsPage';
import EventsPage from './pages/EventsPage';
import QuotesPage from './pages/QuotesPage';
import EventRequestPage from './pages/EventRequestPage';
import EventSummaryPage from './pages/EventSummaryPage';

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

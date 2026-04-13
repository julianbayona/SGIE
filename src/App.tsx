import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';
import ClientsPage from './pages/ClientsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CalendarPage />} />
          <Route path="clients" element={<ClientsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

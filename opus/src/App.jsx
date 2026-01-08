import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, User, QrCode, Home, PlusCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import './index.css';

import { EventProvider } from './context/EventContext';

// Components
import EventList from './components/EventList';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';
import EventDetail from './components/EventDetail';

function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Hide nav on Detail pages
  if (location.pathname.startsWith('/event/')) return null;

  const NavItem = ({ to, icon: Icon, label, primary }) => (
    <Link to={to} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textDecoration: 'none',
      color: primary ? 'var(--color-primary)' : (isActive(to) ? 'var(--color-primary)' : 'var(--color-text-muted)'),
      flex: 1,
      transform: primary ? 'translateY(-10px)' : 'none'
    }}>
      {primary ? (
        <div style={{
          background: 'var(--color-primary)',
          borderRadius: '50%',
          padding: '12px',
          boxShadow: 'var(--shadow-lg)',
          color: 'white'
        }}>
          <Icon size={28} />
        </div>
      ) : (
        <Icon size={24} />
      )}
      {!primary && <span style={{ fontSize: '10px', marginTop: '4px' }}>{label}</span>}
    </Link>
  );

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 'var(--max-width)',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: '12px 0',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      zIndex: 100
    }}>
      <NavItem to="/" icon={Home} label="Accueil" />
      <NavItem to="/create" icon={PlusCircle} label="Créer" primary />
      <NavItem to="/profile" icon={User} label="Profil" />
    </nav>
  );
}

// Wrapper to handle AnimatePresence logic which needs access to useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<EventList />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/event/:id" element={<EventDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isDetails = location.pathname.startsWith('/event/');

  return (
    <div style={{ paddingBottom: isDetails ? '0' : '70px' }}>
      {children}
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <EventProvider>
      <Toaster position="top-center" richColors theme="light" />
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </EventProvider>
  );
}

export default App;

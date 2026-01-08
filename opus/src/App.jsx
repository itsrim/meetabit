import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Calendar, User, QrCode, Home, PlusCircle, Search, MessageCircle, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import './index.css';

import { EventProvider } from './context/EventContext';

// Components
import EventList from './components/EventList';
import Profile from './components/Profile';
import CreateEvent from './components/CreateEvent';
import EventDetail from './components/EventDetail';
import EventSearch from './components/EventSearch';


function Navigation() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Hide nav on Detail pages
  if (location.pathname.startsWith('/event/')) return null;

  const NavItem = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link to={to} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        color: active ? '#be185d' : 'var(--color-text-muted)',
        gap: '4px',
        flex: 1,
        zIndex: 1
      }}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 'var(--max-width)',
      height: '80px',
      zIndex: 100,
      pointerEvents: 'none',
    }}>
      {/* Curved Background Shape */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 10px',
        alignItems: 'center',
        paddingBottom: '10px'
      }}>
        {/* Left Side */}
        <NavItem to="/" icon={Home} label="Accueil" />
        <NavItem to="/search" icon={Search} label="Explorer" />

        {/* Middle Spacer for Pulse Button */}
        <div style={{ width: '60px' }}></div>

        {/* Right Side */}
        <NavItem to="/calendar" icon={Calendar} label="Agenda" />
        <NavItem to="/profile" icon={User} label="Profil" />
      </div>

      {/* Floating Action Button (FAB) */}
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto'
      }}>
        <Link to="/create" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#be185d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(190, 24, 93, 0.4)',
          border: '4px solid var(--color-background)',
        }}>
          <Plus size={32} />
        </Link>
      </div>
    </div>
  );
}

// Wrapper to handle AnimatePresence logic which needs access to useLocation
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<EventList />} />
        <Route path="/search" element={<EventSearch />} />
        <Route path="/calendar" element={<EventList />} />
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

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <EventProvider>
        <Toaster position="top-center" richColors theme="system" />
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </EventProvider>
    </ThemeProvider>
  );
}

export default App;

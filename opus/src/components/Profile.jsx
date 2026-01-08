import React from 'react';
import { Award, ShieldCheck, MapPin, Clock, Calendar } from 'lucide-react';
import PageTransition from './PageTransition';
import { useEvents } from '../context/EventContext';

const Profile = () => {
    const { events } = useEvents();
    // Filter events where user is registered or is organizer
    const myEvents = events.filter(e => e.registered || e.isOrganizer).sort((a, b) => a.date - b.date);

    return (
        <PageTransition>
            <div className="p-4" style={{ paddingBottom: '90px' }}>

                {/* Header Profile */}
                <div className="flex flex-col items-center mb-4 pt-4">
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                            alt="Profile"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid var(--color-surface)',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            background: 'var(--color-success)',
                            color: 'white',
                            padding: '4px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                        }}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <h2 className="font-bold text-lg">Thomas R.</h2>
                    <span className="text-muted text-sm">Membre depuis 2024</span>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>4.9</span>
                        <span className="text-muted text-xs">Fiabilité</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span className="text-primary font-bold" style={{ fontSize: '24px' }}>{myEvents.length}</span>
                        <span className="text-muted text-xs">Événements</span>
                    </div>
                    <div className="card p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>0</span>
                        <span className="text-muted text-xs">No-shows</span>
                    </div>
                </div>

                {/* Reliability Section */}
                <div className="card p-4" style={{ marginBottom: '24px' }}>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Indicateur de Sérieux</h3>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            padding: '4px 8px',
                            background: '#dcfce7',
                            color: '#15803d',
                            borderRadius: '999px'
                        }}>Exemplaire</span>
                    </div>

                    <div style={{ width: '100%', background: '#e4e4e7', borderRadius: '10px', height: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '95%', background: 'var(--color-primary)', height: '100%', borderRadius: '10px' }}></div>
                    </div>
                    <p className="text-sm text-muted">
                        Thomas est un participant très fiable. Il confirme sa présence et arrive à l'heure.
                    </p>
                </div>

                {/* Badges */}
                <h3 className="font-bold mb-2">Badges</h3>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                    {['Ponctuel', 'Organisateur', 'Amical', 'Explorateur'].map((badge, i) => (
                        <div key={i} className="card" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}>
                            <Award size={16} style={{ color: '#eab308' }} />
                            <span className="text-sm font-bold">{badge}</span>
                        </div>
                    ))}
                </div>

                {/* Historique - Fixed Integration */}
                <h3 className="font-bold mb-2">Mes événements à venir</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myEvents.length > 0 ? myEvents.map((event) => (
                        <div key={event.id} className="card p-3" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                                src={event.image}
                                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', background: '#eee' }}
                                alt={event.title}
                            />
                            <div style={{ flex: 1 }}>
                                <div className="font-bold text-sm" style={{ marginBottom: '2px' }}>{event.title}</div>
                                <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                    <span>•</span>
                                    <span>{event.time}</span>
                                    <span>•</span>
                                    <span style={{ color: event.isOrganizer ? 'var(--color-primary)' : 'var(--color-success)' }}>
                                        {event.isOrganizer ? 'Organisateur' : 'Inscrit'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="card p-4 text-center text-muted text-sm">
                            Aucun événement à venir.
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;

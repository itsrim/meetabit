import React, { useState } from 'react';
import { Search, Bell, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import PageTransition from './PageTransition';

const CATEGORIES = ["Tout", "Sorties", "Musée", "Sport", "Rando", "Danse", "Verre"];

const EventSearch = () => {
    const navigate = useNavigate();
    const { events } = useEvents();
    const [selectedCategory, setSelectedCategory] = useState("Tout");

    // Mocking more events for masonry effect
    const allEvents = [...events, ...events, ...events].slice(0, 10);

    return (
        <PageTransition>
            <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingBottom: '100px' }}>

                {/* 1. Top Header */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#ef4444', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                            <MapPin size={16} color="white" fill="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Localisation</div>
                            <div style={{ fontWeight: '700', color: '#18181b' }}>Paris, France</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Search size={20} color="#18181b" />
                        </button>
                        <button style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <Bell size={20} color="#18181b" />
                        </button>
                    </div>
                </div>

                {/* 2. Hero Banner (Green from screenshot) */}
                <div style={{ padding: '0 24px', marginBottom: '24px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #84cc16 0%, #22c55e 100%)', // Lime to Green gradient
                        borderRadius: '24px',
                        padding: '24px',
                        position: 'relative',
                        height: '160px',
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)'
                    }}>
                        <div style={{ width: '55%', zIndex: 1 }}>
                            <div style={{ background: '#f97316', color: 'white', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '12px', width: 'fit-content', marginBottom: '8px' }}>
                                A NE PAS MANQUER
                            </div>
                            <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', lineHeight: '1.2', marginBottom: '8px' }}>
                                Soirée Spéciale Été 2026
                            </h2>
                            <button style={{ background: 'white', color: '#22c55e', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '12px' }}>
                                Voir l'offre
                            </button>
                        </div>
                        {/* Hero Image */}
                        <div style={{ position: 'absolute', right: '-20px', top: '0', height: '100%', width: '60%' }}>
                            <img
                                src="https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                alt="Event"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'rotate(-5deg) scale(1.2)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Categories List */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    padding: '0 24px 24px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '30px',
                                    background: isSelected ? '#f97316' : 'white', // Orange selected, white unselected
                                    color: isSelected ? 'white' : '#71717a',
                                    border: isSelected ? 'none' : '1px solid #e4e4e7',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isSelected ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* 4. Masonry Grid */}
                <div style={{ padding: '0 24px', columns: '2', columnGap: '16px' }}>
                    {allEvents.map((event, index) => {
                        // Random height aspect for masonry feel
                        const heights = [180, 240, 200, 260];
                        const height = heights[index % heights.length];

                        return (
                            <div
                                key={`${event.id}-${index}`}
                                onClick={() => navigate(`/event/${event.id}`)}
                                style={{
                                    breakInside: 'avoid',
                                    marginBottom: '16px',
                                    position: 'relative',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    height: `${height}px`,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}
                            >
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />

                                {/* Overlay Card at Bottom */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                    right: '0',
                                    padding: '12px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'
                                }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        backdropFilter: 'blur(4px)',
                                        borderRadius: '16px',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#18181b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {event.title}
                                            </h4>
                                            <span style={{ fontSize: '10px', color: '#71717a' }}>{event.location.split(',')[0]}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#f97316' }}>
                                            10€
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </PageTransition>
    );
};

export default EventSearch;

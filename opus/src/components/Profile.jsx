import React from 'react';
import { Star, Award, Calendar, ShieldCheck } from 'lucide-react';
import PageTransition from './PageTransition';

const Profile = () => {
    return (
        <PageTransition>
            <div className="p-4" style={{ paddingBottom: '90px' }}>
                {/* Header Profile */}
                <div className="flex flex-col items-center mb-8 pt-4">
                    <div style={{
                        position: 'relative',
                        marginBottom: '1rem'
                    }}>
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
                            border: '2px solid white'
                        }}>
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <h2 className="font-bold text-xl">Thomas R.</h2>
                    <span className="text-muted">Membre depuis 2024</span>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4 mb-6">
                    <div className="card flex-1 p-3 flex flex-col items-center text-center">
                        <span className="text-2xl font-bold text-primary">4.9</span>
                        <span className="text-xs text-muted">Fiabilité</span>
                    </div>
                    <div className="card flex-1 p-3 flex flex-col items-center text-center">
                        <span className="text-2xl font-bold text-primary">12</span>
                        <span className="text-xs text-muted">Événements</span>
                    </div>
                    <div className="card flex-1 p-3 flex flex-col items-center text-center">
                        <span className="text-2xl font-bold text-primary">0</span>
                        <span className="text-xs text-muted">No-shows</span>
                    </div>
                </div>

                {/* Reliability Section */}
                <div className="card p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">Indicateur de Sérieux</h3>
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full" style={{ background: '#dcfce7', color: '#15803d' }}>Exemplaire</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2" style={{ background: '#e4e4e7', borderRadius: '10px', height: '10px' }}>
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '95%', background: 'var(--color-primary)', height: '100%', borderRadius: '10px' }}></div>
                    </div>
                    <p className="text-sm text-muted">
                        Thomas est un participant très fiable. Il confirme sa présence et arrive à l'heure.
                    </p>
                </div>

                {/* Badges */}
                <h3 className="font-bold mb-3">Badges</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {['Ponctuel', 'Organisateur', 'Amical', 'Explorateur'].map((badge, i) => (
                        <div key={i} className="card px-3 py-2 flex items-center gap-2 flex-shrink-0" style={{ minWidth: '100px' }}>
                            <Award size={16} className="text-yellow-500" style={{ color: '#eab308' }} />
                            <span className="text-sm font-bold">{badge}</span>
                        </div>
                    ))}
                </div>

                {/* Historique */}
                <h3 className="font-bold mt-6 mb-3">Derniers Événements</h3>
                <div className="flex flex-col gap-3">
                    {[1, 2].map((_, i) => (
                        <div key={i} className="card p-3 flex gap-3 items-center">
                            <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '8px' }} />
                            <div>
                                <div className="font-bold text-sm">Afterwork Tech</div>
                                <div className="text-xs text-muted">12 Déc • Présent</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
};

export default Profile;

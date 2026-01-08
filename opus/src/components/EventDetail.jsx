import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { ArrowLeft, MapPin, Clock, Send, Users, CheckCircle, Plus, Scan } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import PageTransition from './PageTransition';

// Mock Participants Data
const MOCK_PARTICIPANTS = [
    { id: 1, name: "Sophie M.", score: 4.9, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
    { id: 2, name: "Lucas D.", score: 4.2, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
    { id: 3, name: "Emma W.", score: 5.0, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { id: 4, name: "Thomas R.", score: 4.8, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" }
];

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, toggleRegistration } = useEvents();

    const event = events.find(e => e.id.toString() === id);

    const [showQr, setShowQr] = useState(false);
    const [qrUrl, setQrUrl] = useState('');

    React.useEffect(() => {
        if (showQr && event?.registered && !event?.isOrganizer) {
            QRCode.toDataURL(`ticket-${event.id}-user-123`).then(setQrUrl);
        }
    }, [showQr, event]);

    if (!event) return <div className="p-4">Événement non trouvé</div>;

    const handleShare = (e) => {
        e.stopPropagation();
        toast.success("Lien copié dans le presse-papier !");
    };

    const handleRegistration = () => {
        toggleRegistration(event.id);
        if (!event.registered) {
            toast.success("Hâte de vous voir ! 🥳");
        } else {
            toast("Vous êtes désinscrit.", { icon: '😢' });
        }
    };

    return (
        <PageTransition>
            <div className="pb-24 bg-white min-h-screen">
                {/* Header Image */}
                <div className="relative h-80 w-full">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Glassmorphic Back Button: Fixed Position Top Left */}
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            zIndex: 50,
                            background: 'rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(255,255,255,0.6)'
                        }}
                        className="transition-transform active:scale-95"
                    >
                        <ArrowLeft size={22} color="#18181b" strokeWidth={2.5} />
                    </button>

                    {/* Glassmorphic Share Button: Fixed Position Top Right */}
                    <button
                        onClick={handleShare}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            zIndex: 50,
                            background: 'rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(255,255,255,0.6)'
                        }}
                        className="transition-transform active:scale-95"
                    >
                        <Send size={20} color="var(--color-primary)" strokeWidth={2.5} style={{ marginLeft: '-2px', marginTop: '2px' }} />
                    </button>
                </div>

                {/* Content Container */}
                <div className="bg-white -mt-10 relative z-10 px-6 pt-8 pb-10"
                    style={{
                        borderTopLeftRadius: '32px',
                        borderTopRightRadius: '32px',
                        boxShadow: '0 -10px 40px rgba(0,0,0,0.05)'
                    }}>

                    {/* Handle Bar */}
                    <div style={{ width: '40px', height: '4px', background: '#e4e4e7', borderRadius: '10px', margin: '0 auto 24px' }}></div>

                    <h1 className="font-bold mb-4" style={{ fontSize: '1.75rem', lineHeight: '1.2', color: '#18181b' }}>{event.title}</h1>

                    {/* Meta Info Row */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-primary font-bold text-xs">
                            <Clock size={14} />
                            <span>{event.time}</span>
                        </div>
                        <span className="text-muted text-sm font-medium">
                            {event.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>

                    <div className="flex items-start gap-4 mb-10">
                        <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                                width: '56px', height: '56px',
                                background: '#f4f4f5',
                                borderRadius: '50%',
                                color: '#18181b'
                            }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Lieu</h3>
                            <p className="text-gray-600 text-base leading-snug">{event.location}</p>
                            <p className="text-xs text-muted mt-1 font-medium">12km de votre position</p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="font-bold text-lg mb-3">À propos</h3>
                        <p className="text-gray-500 leading-relaxed text-base">
                            {event.description}
                            <br /><br />
                            Rejoignez-nous pour ce moment unique qui promet d'être mémorable. N'oubliez pas de venir 10 minutes en avance pour profiter pleinement de l'expérience !
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-lg">Participants <span className="text-muted font-normal text-base">({event.attendees})</span></h3>
                            <button className="text-primary text-sm font-bold active:opacity-70">Voir tout</button>
                        </div>

                        <div className="space-y-4">
                            {MOCK_PARTICIPANTS.map(p => (
                                <div key={p.id} className="flex items-center gap-4">
                                    <img
                                        src={p.avatar}
                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                        alt={p.name}
                                        className="shadow-sm border border-gray-100"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div style={{ width: '80px', height: '6px', background: '#f4f4f5', borderRadius: '10px' }}>
                                                <div style={{ height: '100%', background: 'var(--color-success)', borderRadius: '10px', width: `${(p.score / 5) * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-500">{p.score}</span>
                                        </div>
                                    </div>
                                    {p.id === 4 && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full font-bold border border-amber-100">Hôte</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Bar */}
                <div
                    className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t flex gap-3 items-center justify-center mx-auto z-50"
                    style={{ maxWidth: '430px', borderTop: '1px solid rgba(0,0,0,0.05)' }}
                >
                    {event.isOrganizer ? (
                        <button
                            onClick={() => setShowQr(!showQr)}
                            className="btn btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-base shadow-lg shadow-indigo-500/30"
                        >
                            <Scan size={20} /> Scanner les billets
                        </button>
                    ) : (
                        <>
                            {event.registered && (
                                <button
                                    onClick={() => setShowQr(!showQr)}
                                    className="btn flex items-center justify-center p-3.5 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
                                    style={{ aspectRatio: '1/1' }}
                                >
                                    <QrCode size={24} />
                                </button>
                            )}
                            <button
                                onClick={handleRegistration}
                                className="btn w-full flex justify-center items-center gap-2 py-3.5 text-base shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform"
                                style={event.registered ? { background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', boxShadow: 'none' } : { background: 'var(--color-primary)', color: 'white' }}
                            >
                                {event.registered ? <CheckCircle size={20} /> : <Plus size={20} />}
                                {event.registered ? 'Vous participez' : "S'inscrire à l'événement"}
                            </button>
                        </>
                    )}
                </div>

                {/* QR Overlay */}
                {showQr && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQr(false)}>
                        <div
                            className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl transform transition-all scale-100"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="font-bold text-2xl mb-6 text-gray-900">{event.isOrganizer ? 'Scanner' : 'Votre Billet'}</h3>
                            {event.isOrganizer ? (
                                <div className="bg-gray-900 text-white h-72 rounded-2xl flex items-center justify-center mb-6">
                                    <div className="text-center opacity-70">
                                        <Scan size={48} className="mx-auto mb-2" />
                                        <p>Caméra active...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center my-6 p-4 bg-white border-2 border-dashed border-gray-200 rounded-xl">
                                    <img src={qrUrl} alt="QR" className="w-56 h-56" />
                                </div>
                            )}
                            <button onClick={() => setShowQr(false)} className="mt-2 text-primary font-bold px-6 py-2 rounded-full hover:bg-gray-50 transition-colors">Fermer</button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default EventDetail;

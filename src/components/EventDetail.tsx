import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../context/EventContext';
import { getUserData } from '../context/VisitContext';
import { ArrowLeft, MapPin, Clock, Share2, Heart, MessageCircle, Lock, Plus, Ban } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { toast } from 'sonner';

// Génère les participants à partir de getUserData pour cohérence avec UserProfile
const getParticipants = (eventId: number) => {
    // Générer des IDs de participants basés sur l'eventId pour la diversité
    const baseId = (eventId * 7) % 50;
    const participantIds = [baseId, baseId + 1, baseId + 2, baseId + 3].map(id => id % 50);

    return participantIds.map(id => {
        const userData = getUserData(id);
        const score = 4.0 + ((id % 10) / 10); // Score entre 4.0 et 4.9
        return {
            id,
            name: userData.name,
            score: parseFloat(score.toFixed(1)),
            avatar: userData.image
        };
    });
};

const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { events, toggleRegistration } = useEvents();
    const { groups, joinGroup, isKicked, createGroup } = useMessages();

    const event = events.find(e => e.id.toString() === id);
    const participants = getParticipants(parseInt(id || '0'));

    if (!event) return <div className="p-4">Événement non trouvé</div>;

    const handleShare = (): void => {
        toast.success("Lien partagé !");
    };

    const handleRegistration = (): void => {
        toggleRegistration(event.id);
        if (!event.registered) {
            toast.success("Inscription confirmée !");
        } else {
            toast.info("Désinscription prise en compte");
        }
    };

    const shouldHideAddress = event.hideAddressUntilRegistered && !event.registered && !event.isOrganizer;

    return (
        <PageTransition>
            <div style={{ background: 'var(--color-surface)', minHeight: '100vh', position: 'relative', paddingBottom: '90px' }}>

                {/* 1. Header Image Area */}
                <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                    <BlurImage
                        src={event.image}
                        alt={event.title}
                    />

                    {/* Header Icons Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        zIndex: 50
                    }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <ArrowLeft size={20} color="black" />
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleShare}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Share2 size={18} color="black" />
                            </button>
                            <button
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'white',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <Heart size={20} color="black" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Overlapping Content Card */}
                <div style={{
                    position: 'relative',
                    marginTop: '-40px',
                    background: 'var(--color-surface)',
                    borderTopLeftRadius: '32px',
                    borderTopRightRadius: '32px',
                    padding: '32px 24px',
                    minHeight: '500px',
                    zIndex: 10
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        marginBottom: '16px',
                        color: 'var(--color-text)'
                    }}>
                        {event.title}
                    </h1>

                    {/* Price & Count Row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        color: 'var(--color-text-muted)',
                        fontSize: '15px',
                        fontWeight: '500'
                    }}>
                        <span>10.00€ / personne</span>
                        <span>{event.attendees} participants</span>
                    </div>

                    {/* Info Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                <MapPin size={24} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: '500',
                                    color: 'var(--color-text-muted)',
                                    filter: shouldHideAddress ? 'blur(5px)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {shouldHideAddress ? (
                                        <>
                                            <span>Inscrivez-vous pour voir l'adresse</span>
                                            <Lock size={12} color="#f59e0b" />
                                        </>
                                    ) : event.location}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                <Clock size={24} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', color: 'var(--color-text-muted)' }}>
                                    {event.date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}, {event.time}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '32px' }}>
                        <p style={{ lineHeight: '1.6', color: 'var(--color-text-muted)', fontSize: '15px' }}>
                            {event.description}
                            <br /><br />
                            Un tournoi hebdomadaire où vous pouvez gagner de l'expérience en affrontant des adversaires de votre niveau. C'est une super opportunité de garder la forme !
                        </p>
                    </div>

                    {/* Participants - Restored */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--color-text)' }}>Participants</h3>
                            <button style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Voir tout</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {participants.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/user/${p.id}`)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <BlurImage
                                            src={p.avatar}
                                            alt={p.name}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '700', color: 'var(--color-text)', marginBottom: '4px' }}>{p.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '80px', height: '6px', background: 'var(--color-border)', borderRadius: '10px' }}>
                                                <div style={{ height: '100%', background: 'var(--color-success)', borderRadius: '10px', width: `${(p.score / 5) * 100}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-muted)' }}>{p.score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Registration Warning */}
                    <div style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--color-text)', fontWeight: '500' }}>
                        Les inscriptions se terminent 15 minutes avant le début de l'événement !
                    </div>

                    {/* Map Placeholder */}
                    <div style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: '16px',
                        background: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80) center/cover',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)' }}></div>
                    </div>
                </div>

                {/* 3. Bottom Action Bar */}
                <div style={{
                    position: 'fixed',
                    bottom: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '430px',
                    background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    zIndex: 100
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-text)' }}>10.00€</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>/ personne</span>
                    </div>

                    {(() => {
                        const associatedGroup = groups.find(g => g.eventId === event.id);
                        const kicked = associatedGroup ? isKicked(associatedGroup.id) : false;
                        const isMember = associatedGroup?.members.includes('Moi');
                        const canJoin = event.registered && !isMember && !kicked;
                        const unreadCount = associatedGroup?.msg || 0;

                        return (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (associatedGroup) {
                                        if (kicked) {
                                            toast.error(t('chat.accessDenied'));
                                            return;
                                        }
                                        if (isMember) {
                                            navigate(`/chat/group-${associatedGroup.id}`);
                                        } else if (canJoin) {
                                            joinGroup(associatedGroup.id);
                                            navigate(`/chat/group-${associatedGroup.id}`);
                                            toast.success(t('chat.joinChat'));
                                        } else if (!event.registered) {
                                            toast.info("Inscrivez-vous d'abord pour rejoindre la discussion !");
                                        }
                                    } else if (event.registered) {
                                        // Création paresseuse du groupe si inscrit mais pas de groupe
                                        const newId = createGroup(event.title, event.id);
                                        // On simule un message reçu pour que l'utilisateur voie la pastille
                                        setTimeout(() => {
                                            setGroups(prev => prev.map(g => g.id === newId ? { ...g, msg: 1, lastMessage: "Bienvenue dans la discussion !" } : g));
                                        }, 1000);
                                        navigate(`/chat/group-${newId}`);
                                        toast.success("Discussion créée !");
                                    } else {
                                        toast.info("Inscrivez-vous pour démarrer la discussion !");
                                    }
                                }}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <MessageCircle size={24} color="var(--color-text)" />

                                {/* Badge de messages non lus - Toujours visible si msg > 0 */}
                                {unreadCount > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: '900',
                                        minWidth: '22px',
                                        height: '22px',
                                        borderRadius: '11px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2.5px solid var(--color-surface)',
                                        padding: '0 4px',
                                        zIndex: 10,
                                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                    }}>
                                        {unreadCount}
                                    </div>
                                )}

                                {/* Indicateur d'ajout si non membre et peut rejoindre - Décalé en bas à droite */}
                                {canJoin && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        right: '-4px',
                                        background: '#22c55e',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--color-surface)',
                                        zIndex: 3
                                    }}>
                                        <Plus size={10} color="white" strokeWidth={4} />
                                    </div>
                                )}

                                {/* Indicateur Bloqué - En bas à droite aussi si bloqué */}
                                {kicked && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        right: '-4px',
                                        background: '#ef4444',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--color-surface)',
                                        zIndex: 3
                                    }}>
                                        <Ban size={10} color="white" strokeWidth={4} />
                                    </div>
                                )}
                            </button>
                        );
                    })()}

                    <button
                        onClick={handleRegistration}
                        className="btn-primary"
                        style={{
                            flex: 1,
                            height: '50px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: event.registered ? 'var(--color-surface-hover)' : '#be185d',
                            border: event.registered ? '1px solid var(--color-border)' : 'none',
                            color: event.registered ? 'var(--color-text)' : 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {event.registered ? 'Inscrit ✔' : "S'inscrire"}
                    </button>
                </div>

            </div>
        </PageTransition>
    );
};

export default EventDetail;


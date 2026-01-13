import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../context/EventContext';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import { getUserData } from '../context/VisitContext';
import { ArrowLeft, MapPin, Clock, Share2, Heart, MessageCircle, Lock, Plus, Ban, Crown } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { ParticipantsList, Participant } from './Event';
import { toast } from 'sonner';

// Participant spécial : l'organisateur (Moi)
const getOrganizerParticipant = (): Participant => ({
    id: -1,
    name: 'Moi (Organisateur)',
    score: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=68',
    status: 'confirmed'
});

// Génère les participants
const getParticipants = (eventId: number, requiresApproval: boolean, maxAttendees: number, isOrganizer: boolean): Participant[] => {
    const baseId = (eventId * 7) % 50;
    const participants: Participant[] = [];

    if (isOrganizer) {
        participants.push(getOrganizerParticipant());
    }

    if (requiresApproval) {
        const otherConfirmedCount = isOrganizer ? maxAttendees - 1 : maxAttendees;
        const pendingCount = 3;
        const totalOthers = otherConfirmedCount + pendingCount;
        const participantIds = Array.from({ length: totalOthers }, (_, i) => (baseId + i) % 50);

        participantIds.forEach((id, index) => {
            const userData = getUserData(id);
            participants.push({
                id,
                name: userData.name,
                score: parseFloat((4.0 + ((id % 10) / 10)).toFixed(1)),
                avatar: userData.image,
                status: index < otherConfirmedCount ? 'confirmed' : 'pending'
            });
        });
    } else {
        const otherCount = isOrganizer ? 3 : 4;
        const participantIds = Array.from({ length: otherCount }, (_, i) => (baseId + i) % 50);
        participantIds.forEach((id) => {
            const userData = getUserData(id);
            participants.push({
                id,
                name: userData.name,
                score: parseFloat((4.0 + ((id % 10) / 10)).toFixed(1)),
                avatar: userData.image,
                status: 'confirmed'
            });
        });
    }

    return participants;
};

const EventDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { events, toggleRegistration } = useEvents();
    const { groups, joinGroup, isKicked, createGroup } = useMessages();
    const { isPremium } = useFeatureFlags();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const navigateToProfile = (userId: number) => {
        if (!isPremium) {
            toast.error(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={18} color="#fbbf24" />
                    <span>{t('premium.profileRequired', 'Passez Premium pour voir les profils')}</span>
                </div>
            );
            return;
        }
        navigate(`/user/${userId}`);
    };

    const event = events.find(e => e.id.toString() === id);
    const requiresManualApproval = event ? (event.id % 2 === 0) : false;

    const [participantsList, setParticipantsList] = useState<Participant[]>(() =>
        getParticipants(parseInt(id || '0'), requiresManualApproval, event?.maxAttendees || 4, event?.isOrganizer || false)
    );

    useEffect(() => {
        if (event) {
            setParticipantsList(getParticipants(event.id, requiresManualApproval, event.maxAttendees, event.isOrganizer));
        }
    }, [id, event?.id, requiresManualApproval, event?.maxAttendees, event?.isOrganizer]);

    const handleApproveParticipant = (participantId: number) => {
        setParticipantsList(prev => prev.map(p =>
            p.id === participantId ? { ...p, status: 'confirmed' } : p
        ));
        toast.success("Participant validé !");
    };

    const handleRemoveParticipant = (participantId: number) => {
        setParticipantsList(prev => prev.filter(p => p.id !== participantId));
        toast.info("Participant retiré");
    };

    if (!event) return <div className="p-4">Événement non trouvé</div>;

    const handleShare = () => toast.success("Lien partagé !");

    const handleRegistration = () => {
        toggleRegistration(event.id);
        toast[event.registered ? 'info' : 'success'](
            event.registered ? "Désinscription prise en compte" : "Inscription confirmée !"
        );
    };

    const shouldHideAddress = event.hideAddressUntilRegistered && !event.registered && !event.isOrganizer;

    // Chat button logic
    const associatedGroup = groups.find(g => g.eventId === event.id);
    const kicked = associatedGroup ? isKicked(associatedGroup.id) : false;
    const isMember = associatedGroup?.members.includes('Moi');
    const canJoin = event.registered && !isMember && !kicked;
    const unreadCount = associatedGroup?.msg || 0;

    const handleChatClick = () => {
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
            const newId = createGroup(event.title, event.id);
            navigate(`/chat/group-${newId}`);
            toast.success("Discussion créée !");
        } else {
            toast.info("Inscrivez-vous pour démarrer la discussion !");
        }
    };

    return (
        <PageTransition>
            <div style={{ background: 'var(--color-surface)', minHeight: '100vh', position: 'relative', paddingBottom: '90px' }}>
                {/* Header Image */}
                <div style={{ position: 'relative', height: '350px', width: '100%' }}>
                    <BlurImage src={event.image} alt={event.title} />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, padding: '20px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 50
                    }}>
                        <button onClick={() => navigate(-1)} style={iconButtonStyle}>
                            <ArrowLeft size={20} color="black" />
                        </button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleShare} style={iconButtonStyle}>
                                <Share2 size={18} color="black" />
                            </button>
                            <button style={iconButtonStyle}>
                                <Heart size={20} color="black" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div style={{
                    position: 'relative', marginTop: '-40px', background: 'var(--color-surface)',
                    borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '32px 24px', minHeight: '500px', zIndex: 10
                }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px', color: 'var(--color-text)' }}>
                        {event.title}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', color: 'var(--color-text-muted)', fontSize: '15px', fontWeight: '500' }}>
                        <span>10.00€ / personne</span>
                        <span>{event.attendees} participants</span>
                    </div>

                    {/* Info Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                        <InfoRow icon={<MapPin size={24} />} blurred={shouldHideAddress}>
                            {shouldHideAddress ? (
                                <><span>Inscrivez-vous pour voir l'adresse</span><Lock size={12} color="#f59e0b" /></>
                            ) : event.location}
                        </InfoRow>
                        <InfoRow icon={<Clock size={24} />}>
                            {event.date.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}, {event.time}
                        </InfoRow>
                    </div>

                    <p style={{ lineHeight: '1.6', color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '32px' }}>
                        {event.description}<br /><br />
                        Un tournoi hebdomadaire où vous pouvez gagner de l'expérience en affrontant des adversaires de votre niveau.
                    </p>

                    {/* Participants List */}
                    <ParticipantsList
                        participants={participantsList}
                        maxAttendees={event.maxAttendees}
                        isOrganizer={event.isOrganizer}
                        requiresManualApproval={requiresManualApproval}
                        onNavigateToProfile={navigateToProfile}
                        onApproveParticipant={handleApproveParticipant}
                        onRemoveParticipant={handleRemoveParticipant}
                    />

                    <p style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--color-text)', fontWeight: '500' }}>
                        Les inscriptions se terminent 15 minutes avant le début de l'événement !
                    </p>

                    <div style={{
                        width: '100%', height: '120px', borderRadius: '16px',
                        background: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80) center/cover',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)' }} />
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div style={{
                    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '100%', maxWidth: '430px', background: 'var(--color-surface)',
                    borderTop: '1px solid var(--color-border)', padding: '16px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px', zIndex: 100
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--color-text)' }}>10.00€</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>/ personne</span>
                    </div>

                    <button onClick={handleChatClick} style={{ ...chatButtonStyle, position: 'relative' }}>
                        <MessageCircle size={24} color="var(--color-text)" />
                        {unreadCount > 0 && <Badge count={unreadCount} />}
                        {canJoin && <Indicator color="#22c55e" icon={<Plus size={10} color="white" strokeWidth={4} />} />}
                        {kicked && <Indicator color="#ef4444" icon={<Ban size={10} color="white" strokeWidth={4} />} />}
                    </button>

                    <button onClick={handleRegistration} style={{
                        flex: 1, height: '50px', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                        background: event.registered ? 'var(--color-surface-hover)' : '#be185d',
                        border: event.registered ? '1px solid var(--color-border)' : 'none',
                        color: event.registered ? 'var(--color-text)' : 'white', cursor: 'pointer'
                    }}>
                        {event.registered ? 'Inscrit ✔' : "S'inscrire"}
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};

// Helper components
const iconButtonStyle: React.CSSProperties = {
    width: '40px', height: '40px', background: 'white', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer'
};

const chatButtonStyle: React.CSSProperties = {
    width: '50px', height: '50px', borderRadius: '12px',
    border: '1px solid var(--color-border)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', background: 'transparent',
    flexShrink: 0, cursor: 'pointer'
};

const InfoRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode; blurred?: boolean }> = ({ icon, children, blurred }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ width: '40px', display: 'flex', justifyContent: 'center', color: 'var(--color-text-muted)' }}>{icon}</div>
        <div style={{ fontWeight: '500', color: 'var(--color-text-muted)', filter: blurred ? 'blur(5px)' : 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {children}
        </div>
    </div>
);

const Badge: React.FC<{ count: number }> = ({ count }) => (
    <div style={{
        position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white',
        fontSize: '11px', fontWeight: '900', minWidth: '22px', height: '22px', borderRadius: '11px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2.5px solid var(--color-surface)', padding: '0 4px', zIndex: 10,
        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
    }}>
        {count}
    </div>
);

const Indicator: React.FC<{ color: string; icon: React.ReactNode }> = ({ color, icon }) => (
    <div style={{
        position: 'absolute', bottom: '-4px', right: '-4px', background: color,
        borderRadius: '50%', width: '16px', height: '16px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface)', zIndex: 3
    }}>
        {icon}
    </div>
);

export default EventDetail;

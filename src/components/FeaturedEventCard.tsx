import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, MessageCircle, Plus, Ban } from 'lucide-react';
import { useMessages } from '../context/MessageContext';
import { toast } from 'sonner';
import { Event } from '../types';
import ParticipantStack from './ParticipantStack';
import { useTranslation } from 'react-i18next';

interface FeaturedEventCardProps {
    event: Event;
    backgroundColor?: string;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({
    event,
    backgroundColor = '#c2410c'
}) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { groups, joinGroup, isKicked } = useMessages();

    const formattedDate = {
        day: event.date.getDate(),
        month: event.date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' }),
        year: event.date.getFullYear()
    };

    return (
        <div
            onClick={() => navigate(`/event/${event.id}`)}
            style={{
                flexShrink: 0,
                width: '260px',
                height: '180px',
                background: backgroundColor,
                borderRadius: '32px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Main Image as absolute background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0
            }}>
                <img
                    src={event.image}
                    alt={event.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.8
                    }}
                />
                {/* Gradient Overlay for Title readability */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                }} />
            </div>

            {/* The "Encoche" (Date Notch) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                background: 'white',
                padding: '8px 12px',
                borderBottomRightRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '54px',
                color: '#1e293b',
                boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
                zIndex: 10
            }}>
                <span style={{ fontSize: '16px', fontWeight: '900', lineHeight: '1' }}>{formattedDate.day}</span>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>{formattedDate.month}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>{event.time}</span>
            </div>

            {/* Chat Icon Overlay */}
            {(() => {
                const associatedGroup = groups.find(g => g.eventId === event.id);
                if (!associatedGroup) return null;

                const kicked = isKicked(associatedGroup.id);
                const isMember = associatedGroup.members.includes('Moi');
                const canJoin = event.registered && !isMember && !kicked;
                const unreadCount = associatedGroup.msg || 0;

                return (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
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
                        }}
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '40px',
                            height: '40px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            zIndex: 20,
                            cursor: 'pointer'
                        }}
                    >
                        <MessageCircle size={20} color="#1e293b" />

                        {/* Badge de messages non lus */}
                        {unreadCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '9px',
                                fontWeight: '800',
                                minWidth: '16px',
                                height: '16px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px solid white',
                                padding: '0 3px',
                                zIndex: 2
                            }}>
                                {unreadCount}
                            </div>
                        )}

                        {/* Indicateur "+" ou "Ban" décalé en bas à droite */}
                        {canJoin && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                background: '#22c55e',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px solid white',
                                zIndex: 3
                            }}>
                                <Plus size={8} color="white" strokeWidth={5} />
                            </div>
                        )}
                        {kicked && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1.5px solid white',
                                zIndex: 3
                            }}>
                                <Ban size={8} color="white" strokeWidth={5} />
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Title & Location Overlay in Image */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                zIndex: 5
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    lineHeight: '1.2',
                    margin: 0,
                    letterSpacing: '-0.3px',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {event.title}
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px'
                }}>
                    <MapPin size={12} color="rgba(255,255,255,0.85)" />
                    <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.85)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {event.location.split(',')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FeaturedEventCard;

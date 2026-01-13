import React from 'react';
import { Hourglass, Lock } from 'lucide-react';
import ParticipantRow, { Participant } from './ParticipantRow';

interface ParticipantsListProps {
    participants: Participant[];
    maxAttendees: number;
    isOrganizer: boolean;
    requiresManualApproval: boolean;
    onNavigateToProfile: (userId: number) => void;
    onApproveParticipant: (participantId: number) => void;
    onRemoveParticipant: (participantId: number) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
    participants,
    maxAttendees,
    isOrganizer,
    requiresManualApproval,
    onNavigateToProfile,
    onApproveParticipant,
    onRemoveParticipant
}) => {
    const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
    const pendingParticipants = participants.filter(p => p.status === 'pending');
    const confirmedCount = confirmedParticipants.length;

    return (
        <div style={{ marginBottom: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--color-text)' }}>
                    Participants ({confirmedCount}/{maxAttendees})
                </h3>
                <button style={{
                    color: 'var(--color-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}>
                    Voir tout
                </button>
            </div>

            {/* Liste des confirmés */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {confirmedParticipants.map(p => (
                    <ParticipantRow
                        key={p.id}
                        participant={p}
                        isMe={p.id === -1}
                        isOrganizer={isOrganizer}
                        onNavigate={() => onNavigateToProfile(p.id)}
                        onRemove={() => onRemoveParticipant(p.id)}
                    />
                ))}
            </div>

            {/* Liste d'attente */}
            {requiresManualApproval && pendingParticipants.length > 0 && (
                <>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '20px 0 12px',
                        color: 'var(--color-text-muted)'
                    }}>
                        <Hourglass size={16} />
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Liste d'attente</span>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>
                            ({pendingParticipants.length})
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pendingParticipants.map(p => (
                            <ParticipantRow
                                key={p.id}
                                participant={p}
                                isPending
                                isOrganizer={isOrganizer}
                                canApprove={confirmedCount < maxAttendees}
                                onNavigate={() => onNavigateToProfile(p.id)}
                                onApprove={() => onApproveParticipant(p.id)}
                            />
                        ))}
                    </div>

                    {/* Alerte limite atteinte */}
                    {confirmedCount >= maxAttendees && (
                        <div style={{
                            marginTop: '12px',
                            padding: '10px 14px',
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '10px',
                            fontSize: '13px',
                            color: '#b45309',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Lock size={14} />
                            Limite de participants atteinte
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ParticipantsList;

import React from 'react';
import { UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurImage from '../BlurImage';

export interface Participant {
    id: number;
    name: string;
    score: number;
    avatar: string;
    status: 'confirmed' | 'pending';
}

interface ParticipantRowProps {
    participant: Participant;
    isMe?: boolean;
    isPending?: boolean;
    isOrganizer?: boolean;
    canApprove?: boolean;
    onNavigate?: () => void;
    onRemove?: () => void;
    onApprove?: () => void;
}

const ParticipantRow: React.FC<ParticipantRowProps> = ({
    participant,
    isMe = false,
    isPending = false,
    isOrganizer = false,
    canApprove = true,
    onNavigate,
    onRemove,
    onApprove
}) => {
    const isDisabled = isPending && !canApprove;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: (isOrganizer && isDisabled) ? 0.5 : 1
            }}
        >
            {/* Avatar */}
            <div
                onClick={() => !isMe && onNavigate?.()}
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: isMe
                        ? '2px solid #f97316'
                        : isPending
                            ? '2px dashed var(--color-border)'
                            : '2px solid #22c55e',
                    cursor: isMe ? 'default' : 'pointer',
                    flexShrink: 0
                }}
            >
                <BlurImage src={participant.avatar} alt={participant.name} />
            </div>

            {/* Info */}
            <div
                style={{ flex: 1, cursor: isMe ? 'default' : 'pointer' }}
                onClick={() => !isMe && onNavigate?.()}
            >
                <p style={{ fontWeight: '700', color: 'var(--color-text)', marginBottom: '2px', fontSize: '15px' }}>
                    {participant.name}
                    {isMe && (
                        <span style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                            background: 'linear-gradient(135deg, #f97316, #f472b6)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            fontWeight: '600'
                        }}>
                            VOUS
                        </span>
                    )}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '5px', background: 'var(--color-border)', borderRadius: '10px' }}>
                        <div style={{
                            height: '100%',
                            background: 'var(--color-success)',
                            borderRadius: '10px',
                            width: `${(participant.score / 5) * 100}%`
                        }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)' }}>
                        {participant.score}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {isOrganizer && !isMe && !isPending && onRemove && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <UserMinus size={18} color="#ef4444" />
                </button>
            )}

            {isOrganizer && isPending && onApprove && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) onApprove();
                    }}
                    style={{
                        width: '48px',
                        height: '28px',
                        borderRadius: '14px',
                        background: isDisabled ? '#9ca3af' : '#d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        flexShrink: 0
                    }}
                >
                    <motion.div
                        animate={{ x: 0 }}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'white',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ParticipantRow;

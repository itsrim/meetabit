import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import BlurImage from '../BlurImage';
import { GroupAvatar } from '../Social/GroupAvatar';

interface ChatHeaderProps {
    isGroup: boolean;
    name: string;
    subtitle: string;
    images: string[];
    eventId?: number;
    showSettings: boolean;
    onBack: () => void;
    onToggleSettings: () => void;
    onNavigateToProfile?: () => void;
    onNavigateToEvent?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    isGroup,
    name,
    subtitle,
    images,
    eventId,
    showSettings,
    onBack,
    onToggleSettings,
    onNavigateToProfile,
    onNavigateToEvent
}) => {
    return (
        <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)'
        }}>
            <button
                onClick={onBack}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}
            >
                <ArrowLeft size={24} />
            </button>

            <div
                onClick={() => !isGroup && onNavigateToProfile?.()}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: isGroup ? 'default' : 'pointer' }}
            >
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {isGroup ? (
                        <GroupAvatar images={images} size={44} />
                    ) : (
                        <BlurImage src={images[0] || ''} alt={name} />
                    )}
                </div>

                <div
                    onClick={() => isGroup && eventId && onNavigateToEvent?.()}
                    style={{ cursor: (isGroup && eventId) ? 'pointer' : 'default' }}
                >
                    <h3 style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        {name}
                        {isGroup && eventId && (
                            <span style={{ color: '#3b82f6', fontSize: '14px' }}>↗</span>
                        )}
                    </h3>
                    <span style={{ fontSize: '12px', color: isGroup ? 'var(--color-text-muted)' : '#22c55e' }}>
                        {subtitle}
                    </span>
                </div>
            </div>

            <button
                onClick={onToggleSettings}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px' }}
            >
                <Settings size={22} style={{ transform: showSettings ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s ease' }} />
            </button>
        </div>
    );
};

export default ChatHeader;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BlurImage from '../../BlurImage';
import { GroupAvatar } from '../GroupAvatar';
import { useMessages } from '../../../context/MessageContext';

interface MessagesTabProps {
    searchQuery: string;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ searchQuery }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { getConversations, groups } = useMessages();

    const rawConversations = getConversations();

    // Formater le temps relatif
    const formatRelativeTime = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return t('time.now') || "À l'instant";
        if (diffMins < 60) return t('time.minutesAgo', { count: diffMins }) || `${diffMins} min`;
        if (diffHours < 24) return t('time.hoursAgo', { count: diffHours }) || `${diffHours}h`;
        if (diffDays === 1) return t('time.yesterday') || 'Hier';
        if (diffDays < 7) return t('time.daysAgo', { count: diffDays }) || `${diffDays}j`;
        return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
    };

    // Fusionner groupes et conversations
    const sortedGroups = [...groups].sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

    const mergedMessages = [
        ...sortedGroups.map(g => ({
            id: `group-${g.id}`,
            isGroup: true,
            name: g.name,
            image: g.images,
            lastMessage: g.lastMessage,
            lastMessageTime: g.lastMessageDate,
            unreadCount: g.msg,
            originalId: g.id
        })),
        ...rawConversations.map(c => ({
            id: `conv-${c.otherId}`,
            isGroup: false,
            name: c.name,
            image: [c.image],
            lastMessage: c.lastMessage,
            lastMessageTime: c.lastMessageTime,
            unreadCount: c.unreadCount,
            originalId: c.otherId
        }))
    ].sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    const filteredMergedMessages = mergedMessages.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
            {filteredMergedMessages.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '14px' }}>
                        {searchQuery ? t('social.noSearchResults') || "Aucun résultat trouvé" : t('social.noMessages')}
                    </p>
                    {!searchQuery && <p style={{ fontSize: '12px', marginTop: '8px' }}>{t('social.startConversation')}</p>}
                </div>
            ) : (
                filteredMergedMessages.map(item => (
                    <div
                        key={item.id}
                        onClick={() => {
                            if (item.isGroup) {
                                navigate(`/chat/group-${item.originalId}`);
                            } else {
                                navigate(`/chat/${item.originalId}`);
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', cursor: 'pointer' }}
                    >
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.isGroup ? (
                                    <GroupAvatar images={item.image} size={56} />
                                ) : (
                                    <BlurImage
                                        src={item.image[0]}
                                        alt={item.name}
                                    />
                                )}
                            </div>
                            {item.unreadCount > 0 && (
                                <div style={{
                                    position: 'absolute', bottom: '-2px', right: '-2px',
                                    minWidth: '20px', height: '20px',
                                    background: '#ef4444',
                                    borderRadius: '10px',
                                    border: '2px solid var(--color-surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 4px',
                                    zIndex: 5
                                }}>
                                    <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>
                                        {item.unreadCount}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <h3 style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: 'var(--color-text)',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {item.name}
                                    {item.isGroup && <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>Groupe</span>}
                                </h3>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    {formatRelativeTime(item.lastMessageTime)}
                                </span>
                            </div>
                            <p style={{
                                fontSize: '13px',
                                color: item.unreadCount > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                                fontWeight: item.unreadCount > 0 ? '600' : '400',
                                margin: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {item.lastMessage}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MessagesTab;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Crown, Eye } from 'lucide-react';
import { GroupAvatar } from './GroupAvatar';
import { useMessages } from '../../context/MessageContext';

type TabType = 'suggestions' | 'messages' | 'visitors';

interface SocialHeaderProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isTabSearchExpanded: boolean;
    setIsTabSearchExpanded: (expanded: boolean) => void;
    isPremium: boolean;
    disableMessages: boolean;
    searchDisabled: boolean;
    totalUnread: number;
    visitorsCount: number;
}

const SocialHeader: React.FC<SocialHeaderProps> = ({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isTabSearchExpanded,
    setIsTabSearchExpanded,
    isPremium,
    disableMessages,
    searchDisabled,
    totalUnread,
    visitorsCount
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { groups } = useMessages();

    const sortedGroups = [...groups].sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

    return (
        <>
            {/* Header with Gradient - Compact */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                padding: '12px 16px 12px',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px',
                boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                marginBottom: '0',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative', height: '72px' }}>
                    {/* Friends Horizontal Scroll */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        gap: '14px',
                        overflowX: 'auto',
                        paddingRight: '20px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                        maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        {sortedGroups.map(group => (
                            <div
                                key={group.id}
                                onClick={() => {
                                    if (disableMessages) return;
                                    navigate(`/chat/group-${group.id}`);
                                }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.4)',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}>
                                        <GroupAvatar images={group.images} size={48} />
                                    </div>
                                    {group.msg > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '0',
                                            right: '0',
                                            backgroundColor: '#ef4444',
                                            borderRadius: '50%',
                                            width: '18px',
                                            height: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            border: '1px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {group.msg}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {group.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area Start (Outer wrap in SocialPage) */}
            <div style={{
                position: 'sticky',
                top: '0',
                zIndex: 90,
                background: 'var(--color-surface)',
                padding: '14px 16px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <AnimatePresence mode="wait">
                    {!isTabSearchExpanded ? (
                        <motion.div
                            key="tabs-list"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            style={{ display: 'flex', gap: '20px', alignItems: 'center' }}
                        >
                            <button
                                onClick={() => setActiveTab('suggestions')}
                                style={{
                                    background: 'transparent', border: 'none', padding: 0,
                                    fontSize: '15px', fontWeight: activeTab === 'suggestions' ? '800' : '600',
                                    color: activeTab === 'suggestions' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                    transition: 'color 0.2s',
                                    paddingBottom: '6px',
                                    borderBottom: activeTab === 'suggestions' ? '2px solid var(--color-text)' : '2px solid transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('social.suggestions')}
                            </button>
                            <button
                                onClick={() => !disableMessages && setActiveTab('messages')}
                                style={{
                                    background: 'transparent', border: 'none', padding: 0,
                                    fontSize: '15px', fontWeight: activeTab === 'messages' ? '800' : '600',
                                    color: disableMessages ? 'var(--color-text-muted)' : (activeTab === 'messages' ? 'var(--color-text)' : 'var(--color-text-muted)'),
                                    transition: 'color 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    paddingBottom: '6px',
                                    borderBottom: activeTab === 'messages' ? '2px solid var(--color-text)' : '2px solid transparent',
                                    cursor: disableMessages ? 'not-allowed' : 'pointer',
                                    opacity: disableMessages ? 0.5 : 1
                                }}
                            >
                                {t('social.messages')}
                                {!disableMessages && totalUnread > 0 && (
                                    <span style={{
                                        background: '#ef4444', color: 'white',
                                        fontSize: '10px', fontWeight: 'bold',
                                        padding: '2px 6px', borderRadius: '10px',
                                    }}>{totalUnread}</span>
                                )}
                                {disableMessages && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                    }}>
                                        <Crown size={10} color="#111827" />
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={() => isPremium && setActiveTab('visitors')}
                                style={{
                                    background: 'transparent', border: 'none', padding: 0,
                                    fontSize: '15px', fontWeight: activeTab === 'visitors' ? '800' : '600',
                                    color: !isPremium ? 'var(--color-text-muted)' : (activeTab === 'visitors' ? 'var(--color-text)' : 'var(--color-text-muted)'),
                                    transition: 'color 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    paddingBottom: '6px',
                                    borderBottom: activeTab === 'visitors' ? '2px solid #fbbf24' : '2px solid transparent',
                                    cursor: !isPremium ? 'not-allowed' : 'pointer',
                                    opacity: !isPremium ? 0.5 : 1
                                }}
                            >
                                <Eye size={14} />
                                {t('social.visitors')}
                                {isPremium && (
                                    <span style={{
                                        background: '#fbbf24', color: 'white',
                                        fontSize: '10px', fontWeight: 'bold',
                                        padding: '2px 6px', borderRadius: '10px',
                                    }}>{visitorsCount}</span>
                                )}
                                {!isPremium && (
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                    }}>
                                        <Crown size={10} color="#111827" />
                                    </div>
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="tab-search-input"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: '100%' }}
                            exit={{ opacity: 0, width: 0 }}
                            style={{ flex: 1, display: 'flex', alignItems: 'center' }}
                        >
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.05)',
                                borderRadius: '24px',
                                padding: '4px 16px',
                                marginRight: '12px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                height: '44px'
                            }}>
                                <Search size={16} color="var(--color-text-muted)" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={
                                        activeTab === 'suggestions' ? (t('social.searchSuggestions') || "Rechercher un membre...") :
                                            activeTab === 'messages' ? (t('social.searchMessages') || "Rechercher un auteur...") :
                                                (t('social.searchVisitors') || "Rechercher un visiteur...")
                                    }
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '6px 8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'var(--color-text)',
                                        outline: 'none'
                                    }}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', padding: '4px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>×</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => {
                        if (searchDisabled) return;
                        if (isTabSearchExpanded) {
                            setSearchQuery('');
                        }
                        setIsTabSearchExpanded(!isTabSearchExpanded);
                    }}
                    style={{
                        width: '44px', height: '44px',
                        borderRadius: '50%',
                        background: 'transparent',
                        border: 'none',
                        cursor: searchDisabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        opacity: searchDisabled ? 0.6 : 1,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        transform: 'translateY(-4px)'
                    }}
                >
                    {isTabSearchExpanded ? (
                        <X size={24} color="var(--color-text)" />
                    ) : (
                        <Search size={22} color="var(--color-text-muted)" />
                    )}
                    {searchDisabled && (
                        <div style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)',
                            zIndex: 2
                        }}>
                            <Crown size={10} color="#111827" />
                        </div>
                    )}
                </button>
            </div>
        </>
    );
};

export default SocialHeader;

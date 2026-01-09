import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MessageCircle, Heart, Search, Users, Sparkles, Lock, Crown, Eye } from 'lucide-react';
import PageTransition from './PageTransition';
import BlurImage from './BlurImage';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '../context/FeatureFlagContext';

const FRIENDS = [
    { id: 1, name: 'Hanna', image: 'https://i.pravatar.cc/150?img=1', msg: 2 },
    { id: 2, name: 'Sara', image: 'https://i.pravatar.cc/150?img=5', msg: 0 },
    { id: 3, name: 'Georgie', image: 'https://i.pravatar.cc/150?img=9', msg: 5 },
    { id: 4, name: 'Britney', image: 'https://i.pravatar.cc/150?img=4', msg: 1 },
    { id: 5, name: 'Mike', image: 'https://i.pravatar.cc/150?img=8', msg: 0 },
    { id: 6, name: 'Josh', image: 'https://i.pravatar.cc/150?img=11', msg: 3 },
    { id: 7, name: 'Emma', image: 'https://i.pravatar.cc/150?img=16', msg: 0 },
];

// 1000 profils pour tester la virtualisation et la scalabilité
const FIRST_NAMES = [
    'Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose', 'Emma', 'Sophie', 'Clara',
    'Léa', 'Manon', 'Chloé', 'Camille', 'Sarah', 'Laura', 'Julie', 'Marie', 'Anna', 'Eva',
    'Jade', 'Louise', 'Alice', 'Lola', 'Inès', 'Léna', 'Lucie', 'Nina', 'Mia', 'Zoé',
    'Lucas', 'Hugo', 'Louis', 'Nathan', 'Gabriel', 'Jules', 'Adam', 'Raphaël', 'Arthur', 'Léo',
    'Noah', 'Ethan', 'Paul', 'Tom', 'Mathis', 'Théo', 'Maxime', 'Alexandre', 'Antoine', 'Victor'
];

const SUGGESTIONS = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: FIRST_NAMES[i % FIRST_NAMES.length],
    age: 18 + (i % 20), // Ages entre 18 et 37
    image: `https://i.pravatar.cc/600?img=${(i % 70) + 1}`, // 70 images différentes en rotation
    height: 200 + (i % 5) * 30, // Heights variées: 200, 230, 260, 290, 320
    rotation: ((i * 7) % 13) - 6, // Rotation déterministe entre -6 et 6
    offset: (i * 11) % 45 // Offset déterministe entre 0 et 44px
}));

const MESSAGES = [
    { id: 1, name: 'Peggie', age: 23, message: 'That sounds like a lot of fun! Would you like...', time: '5 mins', unread: true, image: 'https://i.pravatar.cc/150?img=30' },
    { id: 2, name: 'Eve', age: 22, message: "I'm good! Thanks", time: '38 mins', unread: false, image: 'https://i.pravatar.cc/150?img=31' },
    { id: 3, name: 'Sofi', age: 26, message: 'Yes, it works for me! See you!', time: '2 hrs', unread: true, image: 'https://i.pravatar.cc/150?img=32' },
    { id: 4, name: 'Rachel', age: 23, message: 'Yeah!', time: '8 hrs', unread: false, image: 'https://i.pravatar.cc/150?img=33' },
    { id: 5, name: 'Roberta', age: 25, message: 'How are you doing?', time: '2 days', unread: false, image: 'https://i.pravatar.cc/150?img=34' },
    { id: 6, name: 'Rosella', age: 21, message: 'Maybe tomorrow?', time: 'Last week', unread: true, image: 'https://i.pravatar.cc/150?img=35' },
];

// Visites du profil (Premium only)
const VISITORS = [
    { id: 1, name: 'Clara', age: 24, time: 'Il y a 2 min', image: 'https://i.pravatar.cc/150?img=41', visits: 3 },
    { id: 2, name: 'Lucas', age: 27, time: 'Il y a 15 min', image: 'https://i.pravatar.cc/150?img=42', visits: 1 },
    { id: 3, name: 'Manon', age: 22, time: 'Il y a 1h', image: 'https://i.pravatar.cc/150?img=43', visits: 5 },
    { id: 4, name: 'Hugo', age: 25, time: 'Il y a 3h', image: 'https://i.pravatar.cc/150?img=44', visits: 2 },
    { id: 5, name: 'Léa', age: 23, time: 'Hier', image: 'https://i.pravatar.cc/150?img=45', visits: 1 },
    { id: 6, name: 'Nathan', age: 28, time: 'Hier', image: 'https://i.pravatar.cc/150?img=46', visits: 4 },
    { id: 7, name: 'Camille', age: 21, time: 'Il y a 2 jours', image: 'https://i.pravatar.cc/150?img=47', visits: 1 },
    { id: 8, name: 'Gabriel', age: 26, time: 'Il y a 3 jours', image: 'https://i.pravatar.cc/150?img=48', visits: 2 },
];

const SocialPage = () => {
    const [activeTab, setActiveTab] = React.useState('suggestions');
    const { isRestricted, isPremium } = useFeatureFlags();
    
    const blurProfiles = isRestricted('blurProfiles');
    const disableMessages = isRestricted('disableMessages');
    const searchDisabled = isRestricted('disableSearch');

    // Render 2 items per row to simulate grid in Virtuoso
    const rows = [];
    for (let i = 0; i < SUGGESTIONS.length; i += 2) {
        rows.push([SUGGESTIONS[i], SUGGESTIONS[i + 1]]);
    }

    const Row = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item, i) => item && (
                    <div
                        key={item.id}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            transform: `rotate(${item.rotation}deg)`,
                            marginTop: `${item.offset}px`,
                        }}
                    >
                        {/* Image avec blur conditionnel */}
                        <div style={{ 
                            width: '100%', 
                            height: '100%',
                            filter: blurProfiles ? 'blur(15px)' : 'none',
                            transform: blurProfiles ? 'scale(1.1)' : 'none'
                        }}>
                            <BlurImage
                                src={item.image}
                                alt={item.name}
                            />
                        </div>
                        
                        {/* Overlay Premium si profils floutés */}
                        {blurProfiles && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: '16px',
                                padding: '16px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Lock size={24} color="#fbbf24" />
                                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>Premium</span>
                            </div>
                        )}
                        
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(5px)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}>
                            <Heart size={16} color="white" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                        }}>
                            <h3 style={{ 
                                color: 'white', 
                                fontWeight: '700', 
                                fontSize: '16px', 
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                filter: blurProfiles ? 'blur(8px)' : 'none'
                            }}>
                                {item.name}, {item.age}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <PageTransition>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white' }}>

                {/* Header with Gradient - Compact */}
                <div style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                    padding: '12px 16px 16px',
                    borderBottomLeftRadius: '24px',
                    borderBottomRightRadius: '24px',
                    boxShadow: '0 10px 30px rgba(244, 114, 182, 0.3)',
                    marginBottom: '0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827' }}>Amitié</h1>
                        <button 
                            disabled={searchDisabled}
                            style={{
                                width: '36px', height: '36px',
                                borderRadius: '50%',
                                background: searchDisabled ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.4)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: searchDisabled ? 'not-allowed' : 'pointer',
                                opacity: searchDisabled ? 0.7 : 1,
                                position: 'relative'
                            }}
                        >
                            <Search size={18} color="#111827" />
                            {searchDisabled && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px rgba(251, 191, 36, 0.4)'
                                }}>
                                    <Crown size={10} color="white" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Friends Horizontal Scroll */}
                    <div style={{
                        display: 'flex',
                        gap: '14px',
                        overflowX: 'auto',
                        paddingBottom: '4px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {FRIENDS.map(friend => (
                            <div key={friend.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '52px', height: '52px',
                                        borderRadius: '50%',
                                        padding: '2px',
                                        background: friend.msg > 0 ? 'linear-gradient(45deg, #ef4444, #ec4899)' : 'rgba(0,0,0,0.15)'
                                    }}>
                                        <div style={{
                                            width: '100%', height: '100%',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '2px solid white'
                                        }}>
                                            <BlurImage
                                                src={friend.image}
                                                alt={friend.name}
                                            />
                                        </div>
                                    </div>
                                    {friend.msg > 0 && (
                                        <div style={{
                                            position: 'absolute', bottom: '-2px', right: '-2px',
                                            background: '#ef4444', color: 'white',
                                            fontSize: '9px', fontWeight: 'bold',
                                            width: '18px', height: '18px',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid white'
                                        }}>
                                            {friend.msg}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#111827' }}>{friend.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, background: '#f9fafb', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                    {/* Data Tabs */}
                    <div style={{ padding: '14px 16px 10px', display: 'flex', gap: '20px' }}>
                        <button
                            onClick={() => setActiveTab('suggestions')}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                fontSize: '15px', fontWeight: activeTab === 'suggestions' ? '800' : '600',
                                color: activeTab === 'suggestions' ? '#111827' : '#9ca3af',
                                transition: 'color 0.2s',
                                paddingBottom: '6px',
                                borderBottom: activeTab === 'suggestions' ? '2px solid #111827' : '2px solid transparent'
                            }}
                        >
                            Suggestions
                        </button>
                        <button
                            onClick={() => !disableMessages && setActiveTab('messages')}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                fontSize: '15px', fontWeight: activeTab === 'messages' ? '800' : '600',
                                color: disableMessages ? '#d1d5db' : (activeTab === 'messages' ? '#111827' : '#9ca3af'),
                                transition: 'color 0.2s',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                paddingBottom: '6px',
                                borderBottom: activeTab === 'messages' ? '2px solid #111827' : '2px solid transparent',
                                cursor: disableMessages ? 'not-allowed' : 'pointer',
                                opacity: disableMessages ? 0.5 : 1
                            }}
                        >
                            Messages
                            {!disableMessages && (
                                <span style={{
                                    background: '#ef4444', color: 'white',
                                    fontSize: '10px', fontWeight: 'bold',
                                    padding: '2px 6px', borderRadius: '10px',
                                }}>3</span>
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
                                    <Crown size={10} color="white" />
                                </div>
                            )}
                        </button>
                        <button
                            onClick={() => isPremium && setActiveTab('visitors')}
                            style={{
                                background: 'transparent', border: 'none', padding: 0,
                                fontSize: '15px', fontWeight: activeTab === 'visitors' ? '800' : '600',
                                color: !isPremium ? '#d1d5db' : (activeTab === 'visitors' ? '#111827' : '#9ca3af'),
                                transition: 'color 0.2s',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                paddingBottom: '6px',
                                borderBottom: activeTab === 'visitors' ? '2px solid #fbbf24' : '2px solid transparent',
                                cursor: !isPremium ? 'not-allowed' : 'pointer',
                                opacity: !isPremium ? 0.5 : 1
                            }}
                        >
                            <Eye size={14} />
                            Visites
                            {isPremium && (
                                <span style={{
                                    background: '#fbbf24', color: 'white',
                                    fontSize: '10px', fontWeight: 'bold',
                                    padding: '2px 6px', borderRadius: '10px',
                                }}>{VISITORS.length}</span>
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
                                    <Crown size={10} color="white" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Content Switcher */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        {activeTab === 'suggestions' && (
                            <Virtuoso
                                style={{ height: '100%', paddingBottom: '100px' }}
                                data={rows}
                                itemContent={(index) => <Row index={index} style={{}} />}
                            />
                        )}
                        
                        {activeTab === 'messages' && (
                            <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
                                {MESSAGES.map(msg => (
                                    <div key={msg.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden' }}>
                                                <BlurImage
                                                    src={msg.image}
                                                    alt={msg.name}
                                                />
                                            </div>
                                            {msg.unread && (
                                                <div style={{
                                                    position: 'absolute', bottom: '2px', right: '2px',
                                                    width: '12px', height: '12px',
                                                    background: '#10b981',
                                                    borderRadius: '50%',
                                                    border: '2px solid white'
                                                }}></div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                                                    {msg.name}, {msg.age}
                                                    {msg.unread && <span style={{ marginLeft: '6px', color: '#f97316', fontSize: '20px', lineHeight: 0 }}>•</span>}
                                                </h3>
                                                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{msg.time}</span>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                color: msg.unread ? '#374151' : '#9ca3af',
                                                fontWeight: msg.unread ? '600' : '400',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px'
                                            }}>
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'visitors' && (
                            <div style={{ padding: '0 24px 100px', overflowY: 'auto', height: '100%' }}>
                                {/* Premium Badge */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Crown size={24} color="white" />
                                    <div>
                                        <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                                            Fonctionnalité Premium
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                                            {VISITORS.length} personnes ont visité votre profil
                                        </div>
                                    </div>
                                </div>

                                {VISITORS.map(visitor => (
                                    <div key={visitor.id} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '16px', 
                                        marginBottom: '16px', 
                                        cursor: 'pointer',
                                        padding: '12px',
                                        background: 'white',
                                        borderRadius: '16px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden' }}>
                                                <BlurImage
                                                    src={visitor.image}
                                                    alt={visitor.name}
                                                />
                                            </div>
                                            {visitor.visits > 1 && (
                                                <div style={{
                                                    position: 'absolute', bottom: '-4px', right: '-4px',
                                                    background: '#fbbf24',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    border: '2px solid white'
                                                }}>
                                                    x{visitor.visits}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>
                                                {visitor.name}, {visitor.age}
                                            </h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Eye size={12} color="#9ca3af" />
                                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{visitor.time}</span>
                                            </div>
                                        </div>
                                        <button style={{
                                            background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}>
                                            <Heart size={12} style={{ marginRight: '4px', display: 'inline' }} />
                                            Like
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default SocialPage;

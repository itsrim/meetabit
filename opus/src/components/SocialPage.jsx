import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { MessageCircle, Heart, Search } from 'lucide-react';
import PageTransition from './PageTransition';
import { useNavigate } from 'react-router-dom';

const FRIENDS = [
    { id: 1, name: 'Hanna', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', msg: 2 },
    { id: 2, name: 'Sara', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', msg: 0 },
    { id: 3, name: 'Georgie', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', msg: 5 },
    { id: 4, name: 'Britney', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', msg: 1 },
    { id: 5, name: 'Mike', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', msg: 0 },
    { id: 6, name: 'Josh', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', msg: 3 },
    { id: 7, name: 'Emma', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', msg: 0 },
];

const SUGGESTIONS = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    name: ['Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose'][i % 7],
    age: 20 + (i % 10),
    image: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1516726817505-f5ed825b05a8?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80'
    ][i % 6],
    height: i % 2 === 0 ? 280 : 220
}));

const SocialPage = () => {
    // Render 2 items per row to simulate grid in Virtuoso
    const rows = [];
    for (let i = 0; i < SUGGESTIONS.length; i += 2) {
        rows.push([SUGGESTIONS[i], SUGGESTIONS[i + 1]]);
    }

    const Row = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item) => item && (
                    <div
                        key={item.id}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
                            <h3 style={{ color: 'white', fontWeight: '700', fontSize: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
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

                {/* Header */}
                <div style={{ padding: '24px 24px 0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Messages</h1>
                        <button style={{
                            width: '44px', height: '44px',
                            borderRadius: '50%', background: '#f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none'
                        }}>
                            <Search size={22} color="#1f2937" />
                        </button>
                    </div>

                    {/* Friends Horizontal Scroll */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        overflowX: 'auto',
                        paddingBottom: '16px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {FRIENDS.map(friend => (
                            <div key={friend.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '64px', height: '64px',
                                        borderRadius: '50%',
                                        padding: '2px',
                                        background: friend.msg > 0 ? 'linear-gradient(45deg, #f97316, #ec4899)' : 'transparent'
                                    }}>
                                        <img
                                            src={friend.image}
                                            alt={friend.name}
                                            style={{
                                                width: '100%', height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid white'
                                            }}
                                        />
                                    </div>
                                    {friend.msg > 0 && (
                                        <div style={{
                                            position: 'absolute', bottom: '0', right: '0',
                                            background: '#ef4444', color: 'white',
                                            fontSize: '10px', fontWeight: 'bold',
                                            width: '20px', height: '20px',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid white'
                                        }}>
                                            {friend.msg}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{friend.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions List */}
                <div style={{ flex: 1, background: '#f9fafb', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', overflow: 'hidden', paddingTop: '24px' }}>
                    <div style={{ padding: '0 24px 16px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Suggestions pour vous</h2>
                    </div>
                    <Virtuoso
                        style={{ height: '100%', paddingBottom: '100px' }}
                        data={rows}
                        itemContent={(index) => <Row index={index} style={{}} />}
                    />
                </div>
            </div>
        </PageTransition>
    );
};

export default SocialPage;

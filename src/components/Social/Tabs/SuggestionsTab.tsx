import React, { CSSProperties } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Heart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlurImage from '../../BlurImage';
import { SUGGESTIONS, Suggestion } from '../../../data/mockSuggestions';

interface SuggestionsTabProps {
    searchQuery: string;
    blurProfiles: boolean;
}

const SuggestionsTab: React.FC<SuggestionsTabProps> = ({ searchQuery, blurProfiles }) => {
    const navigate = useNavigate();

    const filteredSuggestions = SUGGESTIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Render 2 items per row to simulate grid in Virtuoso
    const rows: Suggestion[][] = [];
    for (let i = 0; i < filteredSuggestions.length; i += 2) {
        rows.push([filteredSuggestions[i], filteredSuggestions[i + 1]]);
    }

    interface RowProps {
        index: number;
        style: CSSProperties;
    }

    const Row: React.FC<RowProps> = ({ index, style }) => {
        const items = rows[index];
        return (
            <div style={{ ...style, display: 'flex', gap: '16px', padding: '0 16px 16px' }}>
                {items.map((item, i) => item && (
                    <div
                        key={item.id}
                        onClick={() => !blurProfiles && navigate(`/user/${item.id}`)}
                        style={{
                            flex: 1,
                            height: `${item.height}px`,
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            transform: `rotate(${item.rotation}deg)`,
                            marginTop: `${item.offset}px`,
                            cursor: blurProfiles ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {/* Image avec blur conditionnel */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            filter: blurProfiles ? 'blur(15px)' : 'none',
                            transform: blurProfiles ? 'scale(1.1)' : 'none',
                            pointerEvents: 'none'
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
                                gap: '8px',
                                pointerEvents: 'none'
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
                            border: '1px solid rgba(255,255,255,0.3)',
                            pointerEvents: 'none'
                        }}>
                            <Heart size={16} color="white" />
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '12px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                            pointerEvents: 'none'
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
        <Virtuoso
            style={{ height: '100%', paddingBottom: '100px' }}
            data={rows}
            itemContent={(index) => <Row index={index} style={{}} />}
        />
    );
};

export default SuggestionsTab;

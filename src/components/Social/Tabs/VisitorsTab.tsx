import React from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Eye, Heart } from 'lucide-react';
import BlurImage from '../../BlurImage';
import { useVisits } from '../../../context/VisitContext';

interface VisitorsTabProps {
    searchQuery: string;
}

const VisitorsTab: React.FC<VisitorsTabProps> = ({ searchQuery }) => {
    const { t } = useTranslation();
    const { getMyVisitors } = useVisits();
    const visitors = getMyVisitors();

    const filteredVisitors = visitors.filter((v: any) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
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
                <Crown size={24} color="#111827" />
                <div>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>
                        {t('social.premiumFeature')}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                        {t('social.visitedProfile', { count: visitors.length })}
                    </div>
                </div>
            </div>

            {filteredVisitors.length === 0 ? (
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
                        {searchQuery ? t('social.noSearchResults') || "Aucun résultat trouvé" : t('social.noVisitors') || "Aucune visite pour le moment"}
                    </p>
                </div>
            ) : (
                filteredVisitors.map((visitor: any) => (
                    <div key={visitor.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px',
                        cursor: 'pointer',
                        padding: '12px',
                        background: 'var(--color-background)',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
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
                                    border: '2px solid var(--color-surface)'
                                }}>
                                    x{visitor.visits}
                                </div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text)', marginBottom: '2px' }}>
                                {visitor.name}, {visitor.age}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Eye size={12} color="var(--color-text-muted)" />
                                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{visitor.time}</span>
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
                            {t('social.like')}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default VisitorsTab;

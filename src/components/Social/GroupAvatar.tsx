import React from 'react';
import BlurImage from '../BlurImage';

export const GroupAvatar: React.FC<{ images: string[], size: number }> = ({ images, size }) => {
    const displayImages = images.slice(0, 4);

    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'grid',
            gridTemplateColumns: displayImages.length > 1 ? '1fr 1fr' : '1fr',
            gridTemplateRows: displayImages.length > 2 ? '1fr 1fr' : '1fr',
            gap: '1px',
            background: 'var(--color-border)',
            borderRadius: '50%',
            overflow: 'hidden'
        }}>
            {displayImages.map((img, i) => (
                <div key={i} style={{
                    position: 'relative',
                    overflow: 'hidden',
                    gridColumn: displayImages.length === 3 && i === 2 ? 'span 2' : 'auto'
                }}>
                    <BlurImage src={img} alt={`Member ${i}`} />
                </div>
            ))}
        </div>
    );
};

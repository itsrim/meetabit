import React from 'react';

interface Message {
    id: number;
    content: string;
    senderId: number;
    timestamp: Date;
}

interface ChatMessageBubbleProps {
    message: Message;
    isMe: boolean;
    formatTime: (date: Date) => string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, isMe, formatTime }) => {
    return (
        <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
            <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe
                    ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                    : 'var(--color-surface)',
                color: isMe ? 'white' : 'var(--color-text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <p style={{ fontSize: '14px', lineHeight: '1.4', marginBottom: '4px' }}>
                    {message.content}
                </p>
                <span style={{ fontSize: '10px', opacity: 0.7, display: 'block', textAlign: 'right' }}>
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default ChatMessageBubble;

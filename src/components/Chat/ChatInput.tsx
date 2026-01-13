import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, placeholder, onChange, onSend }) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div style={{
            padding: '12px 16px 24px',
            background: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
        }}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-background)',
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                }}
            />
            <button
                onClick={onSend}
                disabled={!value.trim()}
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    background: value.trim()
                        ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
                        : 'var(--color-border)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: value.trim() ? 'pointer' : 'not-allowed'
                }}
            >
                <Send size={20} />
            </button>
        </div>
    );
};

export default ChatInput;

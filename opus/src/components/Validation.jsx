import React, { useState } from 'react';
import QRCode from 'qrcode';

const Validation = () => {
    const [qrUrl, setQrUrl] = useState('');

    React.useEffect(() => {
        // Generate a mock QR code for the current user
        QRCode.toDataURL('user-id-123-opus-event-456')
            .then(url => {
                setQrUrl(url);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    return (
        <div className="p-4 flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
            <h2 className="font-bold text-lg mb-4">Votre Billet</h2>

            <div className="card p-8 flex flex-col items-center mb-6">
                {qrUrl ? (
                    <img src={qrUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                ) : (
                    <div>Génération...</div>
                )}
                <p className="text-sm text-muted mt-4">Présentez ce code à l'entrée</p>
            </div>

            <button className="btn btn-primary w-full">
                Scanner (Organisateur)
            </button>
        </div>
    );
};

export default Validation;

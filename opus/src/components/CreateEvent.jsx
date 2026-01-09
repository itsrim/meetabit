import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { ArrowLeft, Image as ImageIcon, Users } from 'lucide-react';
import PageTransition from './PageTransition';
import { toast } from 'sonner';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { addEvent } = useEvents();

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        location: '',
        description: '',
        maxAttendees: 50
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Create new event object
        const newEvent = {
            title: formData.title,
            date: new Date(formData.date),
            time: formData.time,
            location: formData.location || 'Lieu secret',
            description: formData.description,
            attendees: 1, // Me
            maxAttendees: parseInt(formData.maxAttendees) || 50,
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80" // Default party image
        };

        addEvent(newEvent);
        toast.success("Événement créé avec succès ! 🎉");
        navigate('/');
    };

    return (
        <PageTransition>
            <div className="p-4 pb-24">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                    <h1 className="font-bold text-xl">Créer un événement</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div
                        className="card flex items-center justify-center text-muted"
                        style={{ height: '150px', border: '2px dashed var(--color-border)', cursor: 'pointer' }}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon size={32} />
                            <span className="text-sm">Ajouter une photo</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Titre de l'événement</label>
                        <input
                            required
                            className="card p-3"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Soirée Pizza"
                            style={{ border: 'none', background: 'var(--color-surface)' }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Date</label>
                            <input
                                type="date"
                                required
                                className="card p-3 w-full"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Heure</label>
                            <input
                                type="time"
                                required
                                className="card p-3 w-full"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className="text-sm font-bold">Lieu</label>
                            <input
                                className="card p-3"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Parc Monceau"
                            />
                        </div>
                        <div className="flex flex-col gap-2" style={{ width: '120px' }}>
                            <label className="text-sm font-bold flex items-center gap-1">
                                <Users size={14} />
                                Max
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                className="card p-3"
                                value={formData.maxAttendees}
                                onChange={e => setFormData({ ...formData, maxAttendees: e.target.value })}
                                placeholder="50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Description</label>
                        <textarea
                            className="card p-3"
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Dites-nous en plus..."
                            style={{ resize: 'none' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary mt-4 py-4 text-lg">
                        Publier l'événement
                    </button>
                </form>
            </div>
        </PageTransition>
    );
};

export default CreateEvent;

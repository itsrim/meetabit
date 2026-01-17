import { v4 as uuid } from 'uuid';
import type { Event, Participation, EventCategory, ParticipationStatus } from '../types/index.js';

// Base de données en mémoire (mock)
const events: Map<string, Event> = new Map();
const participations: Map<string, Participation> = new Map();
const favorites: Map<string, Set<string>> = new Map(); // userId -> Set<eventId>

// Données initiales
function initMockData() {
  const categories: EventCategory[] = ['SORTIE', 'SPORT', 'MUSEE', 'DANSE', 'HIKING', 'DRINKS'];
  const titles = [
    'Randonnée en montagne',
    'Soirée jazz',
    'Visite du Louvre',
    'Cours de salsa',
    'Football entre amis',
    'Apéro networking'
  ];
  const locations = [
    'Paris, France',
    'Lyon, France',
    'Bordeaux, France',
    'Marseille, France'
  ];

  for (let i = 1; i <= 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    
    const event: Event = {
      id: String(i),
      title: titles[i % titles.length],
      description: `Description de l'événement ${i}. Venez nombreux pour un moment convivial !`,
      image: `https://picsum.photos/seed/${i}/800/400`,
      category: categories[i % categories.length],
      date,
      time: `${14 + (i % 8)}:00`,
      location: locations[i % locations.length],
      coordinates: {
        latitude: 48.8566 + Math.random() * 0.1,
        longitude: 2.3522 + Math.random() * 0.1
      },
      maxAttendees: 10 + (i % 20),
      price: i % 3 === 0 ? 0 : 5 + (i % 15),
      currency: 'EUR',
      hideAddressUntilRegistered: i % 4 === 0,
      requireManualApproval: i % 5 === 0,
      isCancelled: false,
      organizerId: String((i % 3) + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    events.set(event.id, event);

    // Ajouter quelques participations
    if (i <= 10) {
      const participation: Participation = {
        id: uuid(),
        userId: String(((i + 1) % 3) + 1),
        eventId: event.id,
        status: 'CONFIRMED',
        registeredAt: new Date(),
        approvedAt: new Date()
      };
      participations.set(participation.id, participation);
    }
  }
}

initMockData();

export class EventDataSource {
  // === QUERIES ===
  async getById(id: string): Promise<Event | null> {
    return events.get(id) || null;
  }

  async getAll(filters?: {
    category?: EventCategory;
    dateFrom?: Date;
    dateTo?: Date;
    location?: string;
    maxPrice?: number;
    hasAvailableSpots?: boolean;
    organizerId?: string;
  }, limit = 20, offset = 0): Promise<{ items: Event[]; totalCount: number }> {
    let items = Array.from(events.values()).filter(e => !e.isCancelled);

    if (filters) {
      if (filters.category) {
        items = items.filter(e => e.category === filters.category);
      }
      if (filters.dateFrom) {
        items = items.filter(e => e.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        items = items.filter(e => e.date <= filters.dateTo!);
      }
      if (filters.location) {
        items = items.filter(e => e.location.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      if (filters.maxPrice !== undefined) {
        items = items.filter(e => e.price <= filters.maxPrice!);
      }
      if (filters.organizerId) {
        items = items.filter(e => e.organizerId === filters.organizerId);
      }
      if (filters.hasAvailableSpots) {
        items = items.filter(e => this.getAttendeesCount(e.id) < e.maxAttendees);
      }
    }

    // Trier par date
    items.sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalCount = items.length;
    items = items.slice(offset, offset + limit);

    return { items, totalCount };
  }

  async getByOrganizer(organizerId: string): Promise<Event[]> {
    return Array.from(events.values()).filter(e => e.organizerId === organizerId);
  }

  async getForDate(date: Date): Promise<Event[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(events.values())
      .filter(e => e.date >= startOfDay && e.date <= endOfDay && !e.isCancelled);
  }

  async getTrending(limit = 10): Promise<Event[]> {
    return Array.from(events.values())
      .filter(e => !e.isCancelled && e.date >= new Date())
      .sort((a, b) => this.getAttendeesCount(b.id) - this.getAttendeesCount(a.id))
      .slice(0, limit);
  }

  // === MUTATIONS ===
  async create(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'isCancelled'>): Promise<Event> {
    const event: Event = {
      ...data,
      id: uuid(),
      isCancelled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    events.set(event.id, event);
    return event;
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    const event = events.get(id);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    const updated = { ...event, ...data, updatedAt: new Date() };
    events.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return events.delete(id);
  }

  async cancel(id: string): Promise<Event> {
    return this.update(id, { isCancelled: true });
  }

  // === PARTICIPATIONS ===
  async register(eventId: string, userId: string): Promise<Participation> {
    const event = await this.getById(eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    // Vérifier capacité
    const attendeesCount = this.getAttendeesCount(eventId);
    if (attendeesCount >= event.maxAttendees) {
      throw new Error('Événement complet');
    }

    // Vérifier si déjà inscrit
    const existing = Array.from(participations.values())
      .find(p => p.eventId === eventId && p.userId === userId && p.status !== 'CANCELLED');
    if (existing) {
      throw new Error('Déjà inscrit à cet événement');
    }

    const participation: Participation = {
      id: uuid(),
      userId,
      eventId,
      status: event.requireManualApproval ? 'PENDING' : 'CONFIRMED',
      registeredAt: new Date(),
      approvedAt: event.requireManualApproval ? undefined : new Date()
    };

    participations.set(participation.id, participation);
    return participation;
  }

  async cancelRegistration(eventId: string, userId: string): Promise<Participation> {
    const participation = Array.from(participations.values())
      .find(p => p.eventId === eventId && p.userId === userId && p.status !== 'CANCELLED');
    
    if (!participation) {
      throw new Error('Inscription non trouvée');
    }

    const updated: Participation = {
      ...participation,
      status: 'CANCELLED',
      cancelledAt: new Date()
    };
    participations.set(participation.id, updated);
    return updated;
  }

  async approveParticipant(eventId: string, userId: string, approvedById: string): Promise<Participation> {
    const participation = Array.from(participations.values())
      .find(p => p.eventId === eventId && p.userId === userId && p.status === 'PENDING');
    
    if (!participation) {
      throw new Error('Inscription en attente non trouvée');
    }

    const updated: Participation = {
      ...participation,
      status: 'CONFIRMED',
      approvedAt: new Date(),
      approvedById
    };
    participations.set(participation.id, updated);
    return updated;
  }

  async rejectParticipant(eventId: string, userId: string, reason?: string): Promise<Participation> {
    const participation = Array.from(participations.values())
      .find(p => p.eventId === eventId && p.userId === userId && p.status === 'PENDING');
    
    if (!participation) {
      throw new Error('Inscription en attente non trouvée');
    }

    const updated: Participation = {
      ...participation,
      status: 'REJECTED',
      notes: reason
    };
    participations.set(participation.id, updated);
    return updated;
  }

  async getParticipations(eventId: string, status?: ParticipationStatus): Promise<Participation[]> {
    let items = Array.from(participations.values()).filter(p => p.eventId === eventId);
    if (status) {
      items = items.filter(p => p.status === status);
    }
    return items;
  }

  async getUserParticipations(userId: string): Promise<Participation[]> {
    return Array.from(participations.values())
      .filter(p => p.userId === userId && p.status !== 'CANCELLED');
  }

  getAttendeesCount(eventId: string): number {
    return Array.from(participations.values())
      .filter(p => p.eventId === eventId && p.status === 'CONFIRMED')
      .length;
  }

  // === FAVORITES ===
  async addFavorite(userId: string, eventId: string): Promise<Event> {
    if (!favorites.has(userId)) {
      favorites.set(userId, new Set());
    }
    favorites.get(userId)!.add(eventId);
    return events.get(eventId)!;
  }

  async removeFavorite(userId: string, eventId: string): Promise<Event> {
    const userFavorites = favorites.get(userId);
    if (userFavorites) {
      userFavorites.delete(eventId);
    }
    return events.get(eventId)!;
  }

  async getUserFavorites(userId: string): Promise<Event[]> {
    const userFavorites = favorites.get(userId);
    if (!userFavorites) return [];
    return Array.from(userFavorites).map(id => events.get(id)).filter(Boolean) as Event[];
  }

  isFavorite(userId: string, eventId: string): boolean {
    return favorites.get(userId)?.has(eventId) || false;
  }
}

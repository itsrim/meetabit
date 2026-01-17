import { GraphQLError } from 'graphql';
import type { Context } from '../context.js';
import type { Event, Participation, EventCategory } from '../types/index.js';

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Non authentifié', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
}

export const eventResolvers = {
  Query: {
    event: async (_: unknown, { id }: { id: string }, context: Context) => {
      return context.dataSources.events.getById(id);
    },

    events: async (_: unknown, { filters, pagination }: { 
      filters?: {
        category?: EventCategory;
        dateFrom?: Date;
        dateTo?: Date;
        location?: string;
        maxPrice?: number;
        hasAvailableSpots?: boolean;
        organizerId?: string;
      };
      pagination?: { limit?: number; offset?: number };
    }, context: Context) => {
      const { items, totalCount } = await context.dataSources.events.getAll(
        filters,
        pagination?.limit || 20,
        pagination?.offset || 0
      );
      return {
        items,
        totalCount,
        hasMore: (pagination?.offset || 0) + items.length < totalCount,
        nextCursor: null
      };
    },

    trendingEvents: async (_: unknown, { limit }: { limit?: number }, context: Context) => {
      return context.dataSources.events.getTrending(limit || 10);
    },

    myEvents: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.getByOrganizer(authUser.id);
    },

    myRegistrations: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.getUserParticipations(authUser.id);
    },

    myFavoriteEvents: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.getUserFavorites(authUser.id);
    },

    eventsForDate: async (_: unknown, { date }: { date: Date }, context: Context) => {
      return context.dataSources.events.getForDate(date);
    },

    eventParticipants: async (_: unknown, { eventId, status }: { eventId: string; status?: string }, context: Context) => {
      return context.dataSources.events.getParticipations(eventId, status as any);
    },

    pendingApprovals: async (_: unknown, { eventId }: { eventId: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(eventId);
      
      if (!event || event.organizerId !== authUser.id) {
        throw new GraphQLError('Non autorisé');
      }
      
      return context.dataSources.events.getParticipations(eventId, 'PENDING');
    }
  },

  Mutation: {
    createEvent: async (_: unknown, { input }: { input: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'isCancelled' | 'organizerId'> }, context: Context) => {
      const authUser = requireAuth(context);
      
      // Vérifier les limites
      const user = await context.dataSources.users.getById(authUser.id);
      const isPremium = user ? context.dataSources.users.isPremium(user) : false;
      const limits = context.dataSources.notifications.getUserLimits(isPremium);
      const myEvents = await context.dataSources.events.getByOrganizer(authUser.id);
      
      if (myEvents.length >= limits.maxActiveEvents) {
        throw new GraphQLError(`Limite de ${limits.maxActiveEvents} événements atteinte`);
      }

      return context.dataSources.events.create({
        ...input,
        price: input.price || 0,
        currency: 'EUR',
        hideAddressUntilRegistered: input.hideAddressUntilRegistered || false,
        requireManualApproval: input.requireManualApproval || false,
        organizerId: authUser.id
      });
    },

    updateEvent: async (_: unknown, { id, input }: { id: string; input: Partial<Event> }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(id);
      
      if (!event) {
        throw new GraphQLError('Événement non trouvé');
      }
      
      if (event.organizerId !== authUser.id && authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.events.update(id, input);
    },

    deleteEvent: async (_: unknown, { id }: { id: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(id);
      
      if (!event) {
        throw new GraphQLError('Événement non trouvé');
      }
      
      if (event.organizerId !== authUser.id && authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.events.delete(id);
    },

    cancelEvent: async (_: unknown, { id }: { id: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(id);
      
      if (!event) {
        throw new GraphQLError('Événement non trouvé');
      }
      
      if (event.organizerId !== authUser.id && authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.events.cancel(id);
    },

    registerToEvent: async (_: unknown, { eventId }: { eventId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.register(eventId, authUser.id);
    },

    cancelRegistration: async (_: unknown, { eventId }: { eventId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.cancelRegistration(eventId, authUser.id);
    },

    approveParticipant: async (_: unknown, { eventId, userId }: { eventId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(eventId);
      
      if (!event || event.organizerId !== authUser.id) {
        throw new GraphQLError('Non autorisé');
      }

      const participation = await context.dataSources.events.approveParticipant(eventId, userId, authUser.id);
      
      // Envoyer une notification
      await context.dataSources.notifications.sendParticipationApproved(userId, eventId, event.title);
      
      return participation;
    },

    rejectParticipant: async (_: unknown, { eventId, userId, reason }: { eventId: string; userId: string; reason?: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(eventId);
      
      if (!event || event.organizerId !== authUser.id) {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.events.rejectParticipant(eventId, userId, reason);
    },

    removeParticipant: async (_: unknown, { eventId, userId }: { eventId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      const event = await context.dataSources.events.getById(eventId);
      
      if (!event || event.organizerId !== authUser.id) {
        throw new GraphQLError('Non autorisé');
      }

      await context.dataSources.events.cancelRegistration(eventId, userId);
      return true;
    },

    addFavorite: async (_: unknown, { eventId }: { eventId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.addFavorite(authUser.id, eventId);
    },

    removeFavorite: async (_: unknown, { eventId }: { eventId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.events.removeFavorite(authUser.id, eventId);
    }
  },

  Event: {
    organizer: async (event: Event, _: unknown, context: Context) => {
      return context.dataSources.users.getById(event.organizerId);
    },

    participations: async (event: Event, _: unknown, context: Context) => {
      return context.dataSources.events.getParticipations(event.id);
    },

    confirmedParticipants: async (event: Event, _: unknown, context: Context) => {
      const participations = await context.dataSources.events.getParticipations(event.id, 'CONFIRMED');
      const users = await Promise.all(
        participations.map(p => context.dataSources.users.getById(p.userId))
      );
      return users.filter(Boolean);
    },

    pendingParticipants: async (event: Event, _: unknown, context: Context) => {
      const participations = await context.dataSources.events.getParticipations(event.id, 'PENDING');
      const users = await Promise.all(
        participations.map(p => context.dataSources.users.getById(p.userId))
      );
      return users.filter(Boolean);
    },

    attendeesCount: (event: Event, _: unknown, context: Context) => {
      return context.dataSources.events.getAttendeesCount(event.id);
    },

    availableSpots: (event: Event, _: unknown, context: Context) => {
      const attendees = context.dataSources.events.getAttendeesCount(event.id);
      return Math.max(0, event.maxAttendees - attendees);
    },

    isFinished: (event: Event) => {
      return event.date < new Date();
    },

    favoritedBy: async (event: Event, _: unknown, context: Context) => {
      // À implémenter - nécessite une structure de données inversée
      return [];
    },

    group: async (event: Event, _: unknown, context: Context) => {
      // Chercher un groupe lié à cet événement
      const groups = await context.dataSources.messages.getUserGroups(event.organizerId);
      return groups.find(g => g.eventId === event.id) || null;
    }
  },

  Participation: {
    user: async (participation: Participation, _: unknown, context: Context) => {
      return context.dataSources.users.getById(participation.userId);
    },

    event: async (participation: Participation, _: unknown, context: Context) => {
      return context.dataSources.events.getById(participation.eventId);
    },

    approvedBy: async (participation: Participation, _: unknown, context: Context) => {
      if (!participation.approvedById) return null;
      return context.dataSources.users.getById(participation.approvedById);
    }
  }
};

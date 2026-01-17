import { GraphQLError } from 'graphql';
import type { Context } from '../context.js';
import type { User } from '../types/index.js';

// Helper pour vérifier l'authentification
function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Non authentifié', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      const user = await context.dataSources.users.getById(authUser.id);
      if (!user) {
        throw new GraphQLError('Utilisateur non trouvé');
      }
      return user;
    },

    mySettings: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      const settings = await context.dataSources.users.getSettings(authUser.id);
      if (!settings) {
        throw new GraphQLError('Paramètres non trouvés');
      }
      return settings;
    },

    myLimits: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      const user = await context.dataSources.users.getById(authUser.id);
      const isPremium = user ? context.dataSources.users.isPremium(user) : false;
      return context.dataSources.notifications.getUserLimits(isPremium);
    },

    user: async (_: unknown, { id }: { id: string }, context: Context) => {
      return context.dataSources.users.getById(id);
    },

    users: async (_: unknown, { search, pagination }: { search?: string; pagination?: { limit?: number; offset?: number } }, context: Context) => {
      const { items, totalCount } = await context.dataSources.users.getAll(
        search,
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

    suggestions: async (_: unknown, __: unknown, context: Context) => {
      requireAuth(context);
      // Pour l'instant, retourner une liste vide - à implémenter avec un vrai algorithme
      return [];
    },

    profileVisitors: async (_: unknown, { pagination }: { pagination?: { limit?: number; offset?: number } }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.getProfileVisitors(
        authUser.id,
        pagination?.limit || 20,
        pagination?.offset || 0
      );
    }
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: { email: string; password: string; name: string } }, context: Context) => {
      return context.dataSources.users.register(input.email, input.password, input.name);
    },

    login: async (_: unknown, { input }: { input: { email: string; password: string } }, context: Context) => {
      return context.dataSources.users.login(input.email, input.password);
    },

    logout: async () => {
      // Le logout se fait côté client en supprimant le token
      return true;
    },

    refreshToken: async (_: unknown, { refreshToken }: { refreshToken: string }, context: Context) => {
      // À implémenter avec une vraie logique de refresh token
      throw new GraphQLError('Non implémenté');
    },

    forgotPassword: async (_: unknown, { email }: { email: string }) => {
      // À implémenter avec envoi d'email
      console.log(`Password reset requested for: ${email}`);
      return true;
    },

    resetPassword: async (_: unknown, { token, newPassword }: { token: string; newPassword: string }) => {
      // À implémenter avec vérification du token
      console.log(`Password reset with token: ${token}`);
      return true;
    },

    updateUser: async (_: unknown, { input }: { input: { name?: string; bio?: string; avatar?: string } }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.update(authUser.id, input);
    },

    updateSettings: async (_: unknown, { input }: { input: Record<string, unknown> }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.updateSettings(authUser.id, input);
    },

    deleteAccount: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.delete(authUser.id);
    },

    blockUser: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.blockUser(authUser.id, userId);
    },

    unblockUser: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.unblockUser(authUser.id, userId);
    },

    visitProfile: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      const visit = await context.dataSources.users.visitProfile(authUser.id, userId);
      
      // Envoyer une notification au profil visité
      const visitor = await context.dataSources.users.getById(authUser.id);
      if (visitor) {
        await context.dataSources.notifications.sendProfileVisitNotification(
          userId,
          authUser.id,
          visitor.name
        );
      }
      
      return visit;
    },

    upgradeToPremium: async (_: unknown, { paymentToken }: { paymentToken: string }, context: Context) => {
      const authUser = requireAuth(context);
      // À implémenter avec une vraie intégration de paiement
      console.log(`Premium upgrade with token: ${paymentToken}`);
      return context.dataSources.users.upgradeToPremium(authUser.id);
    },

    cancelPremium: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.users.cancelPremium(authUser.id);
    },

    // Admin mutations
    banUser: async (_: unknown, { userId, reason }: { userId: string; reason?: string }, context: Context) => {
      const authUser = requireAuth(context);
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé', { extensions: { code: 'FORBIDDEN' } });
      }
      console.log(`User ${userId} banned. Reason: ${reason}`);
      // À implémenter avec un vrai système de ban
      return context.dataSources.users.getById(userId);
    },

    unbanUser: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé', { extensions: { code: 'FORBIDDEN' } });
      }
      return context.dataSources.users.getById(userId);
    },

    setUserRole: async (_: unknown, { userId, role }: { userId: string; role: string }, context: Context) => {
      const authUser = requireAuth(context);
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé', { extensions: { code: 'FORBIDDEN' } });
      }
      return context.dataSources.users.update(userId, { role: role as 'USER' | 'PREMIUM' | 'ADMIN' });
    }
  },

  User: {
    isPremium: (user: User) => user.role === 'PREMIUM' || user.role === 'ADMIN',
    isAdmin: (user: User) => user.role === 'ADMIN',
    
    organizedEvents: async (user: User, _: unknown, context: Context) => {
      return context.dataSources.events.getByOrganizer(user.id);
    },
    
    participations: async (user: User, _: unknown, context: Context) => {
      return context.dataSources.events.getUserParticipations(user.id);
    },
    
    favoriteEvents: async (user: User, _: unknown, context: Context) => {
      return context.dataSources.events.getUserFavorites(user.id);
    },
    
    groups: async (user: User, _: unknown, context: Context) => {
      const groups = await context.dataSources.messages.getUserGroups(user.id);
      // Retourner les GroupMembers pour ce user
      const result = [];
      for (const group of groups) {
        const members = await context.dataSources.messages.getGroupMembers(group.id);
        const member = members.find(m => m.userId === user.id);
        if (member) result.push(member);
      }
      return result;
    },
    
    conversations: async (user: User, _: unknown, context: Context) => {
      return context.dataSources.messages.getUserConversations(user.id);
    },
    
    eventsOrganizedCount: async (user: User, _: unknown, context: Context) => {
      const events = await context.dataSources.events.getByOrganizer(user.id);
      return events.length;
    },
    
    eventsParticipatedCount: async (user: User, _: unknown, context: Context) => {
      const participations = await context.dataSources.events.getUserParticipations(user.id);
      return participations.filter(p => p.status === 'CONFIRMED').length;
    }
  }
};

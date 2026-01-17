import { GraphQLError } from 'graphql';
import type { Context } from '../context.js';
import type { Notification } from '../types/index.js';

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Non authentifié', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
}

export const notificationResolvers = {
  Query: {
    myNotifications: async (_: unknown, { unreadOnly, pagination }: { unreadOnly?: boolean; pagination?: { limit?: number; offset?: number } }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.notifications.getUserNotifications(
        authUser.id,
        unreadOnly || false,
        pagination?.limit || 50,
        pagination?.offset || 0
      );
    },

    unreadNotificationsCount: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.notifications.getUnreadCount(authUser.id);
    },

    featureConfig: async (_: unknown, __: unknown, context: Context) => {
      return context.dataSources.notifications.getFeatureConfigs();
    },

    isPremiumFeature: async (_: unknown, { feature }: { feature: string }, context: Context) => {
      return context.dataSources.notifications.isPremiumFeature(feature);
    }
  },

  Mutation: {
    markNotificationAsRead: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      return context.dataSources.notifications.markAsRead(id);
    },

    markAllNotificationsAsRead: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.notifications.markAllAsRead(authUser.id);
    },

    deleteNotification: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      return context.dataSources.notifications.delete(id);
    },

    toggleFeatureFlag: async (_: unknown, { key, value }: { key: string; value: boolean }, context: Context) => {
      const authUser = requireAuth(context);
      
      if (authUser.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé', { extensions: { code: 'FORBIDDEN' } });
      }

      return context.dataSources.notifications.toggleFeatureFlag(key, value);
    }
  },

  Notification: {
    user: async (notification: Notification, _: unknown, context: Context) => {
      return context.dataSources.users.getById(notification.userId);
    },

    relatedEvent: async (notification: Notification, _: unknown, context: Context) => {
      if (!notification.relatedEventId) return null;
      return context.dataSources.events.getById(notification.relatedEventId);
    },

    relatedUser: async (notification: Notification, _: unknown, context: Context) => {
      if (!notification.relatedUserId) return null;
      return context.dataSources.users.getById(notification.relatedUserId);
    },

    relatedGroup: async (notification: Notification, _: unknown, context: Context) => {
      if (!notification.relatedGroupId) return null;
      return context.dataSources.messages.getGroupById(notification.relatedGroupId);
    }
  }
};

import { v4 as uuid } from 'uuid';
import type { Notification, NotificationType, FeatureConfig } from '../types/index.js';

// Base de données en mémoire (mock)
const notifications: Notification[] = [];
const featureConfigs: Map<string, FeatureConfig> = new Map();

// Données initiales
function initMockData() {
  // Notifications de demo
  const demoNotifications: Partial<Notification>[] = [
    {
      userId: '1',
      type: 'NEW_MESSAGE',
      title: 'Nouveau message',
      body: 'Bob vous a envoyé un message',
      relatedUserId: '2'
    },
    {
      userId: '1',
      type: 'PARTICIPATION_APPROVED',
      title: 'Inscription confirmée',
      body: 'Votre inscription à "Randonnée en montagne" a été validée',
      relatedEventId: '1'
    },
    {
      userId: '2',
      type: 'EVENT_REMINDER',
      title: 'Rappel événement',
      body: 'L\'événement "Soirée jazz" commence dans 24h',
      relatedEventId: '2'
    }
  ];

  demoNotifications.forEach(n => {
    notifications.push({
      id: uuid(),
      userId: n.userId!,
      type: n.type!,
      title: n.title!,
      body: n.body!,
      data: undefined,
      isRead: false,
      createdAt: new Date(),
      relatedEventId: n.relatedEventId,
      relatedUserId: n.relatedUserId,
      relatedGroupId: n.relatedGroupId
    });
  });

  // Feature flags
  const configs: FeatureConfig[] = [
    { key: 'blur_profiles', value: true, label: 'Flou sur les profils', description: 'Cache les détails des profils pour les utilisateurs gratuits', category: 'privacy', freeOnly: true },
    { key: 'unlimited_favorites', value: true, label: 'Favoris illimités', description: 'Permet d\'ajouter des favoris sans limite', category: 'limits', freeOnly: false },
    { key: 'profile_visits', value: true, label: 'Voir les visiteurs', description: 'Voir qui a visité votre profil', category: 'premium', freeOnly: false },
    { key: 'priority_registration', value: true, label: 'Inscription prioritaire', description: 'Inscription prioritaire aux événements populaires', category: 'premium', freeOnly: false },
    { key: 'mute_users', value: true, label: 'Mettre en sourdine', description: 'Possibilité de mettre des utilisateurs en sourdine', category: 'premium', freeOnly: false }
  ];

  configs.forEach(c => featureConfigs.set(c.key, c));
}

initMockData();

export class NotificationDataSource {
  // === NOTIFICATIONS ===
  async create(data: Omit<Notification, 'id' | 'isRead' | 'readAt' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: uuid(),
      isRead: false,
      createdAt: new Date()
    };
    notifications.push(notification);
    return notification;
  }

  async getUserNotifications(userId: string, unreadOnly = false, limit = 50, offset = 0): Promise<Notification[]> {
    let items = notifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
      items = items.filter(n => !n.isRead);
    }

    return items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  async markAsRead(id: string): Promise<Notification> {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error('Notification non trouvée');
    }
    notifications[index] = {
      ...notifications[index],
      isRead: true,
      readAt: new Date()
    };
    return notifications[index];
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    notifications.forEach((n, i) => {
      if (n.userId === userId && !n.isRead) {
        notifications[i] = { ...n, isRead: true, readAt: new Date() };
      }
    });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    notifications.splice(index, 1);
    return true;
  }

  // === FEATURE CONFIG ===
  async getFeatureConfigs(): Promise<FeatureConfig[]> {
    return Array.from(featureConfigs.values());
  }

  async toggleFeatureFlag(key: string, value: boolean): Promise<FeatureConfig> {
    const config = featureConfigs.get(key);
    if (!config) {
      throw new Error('Feature flag non trouvé');
    }
    const updated = { ...config, value };
    featureConfigs.set(key, updated);
    return updated;
  }

  isPremiumFeature(feature: string): boolean {
    const config = featureConfigs.get(feature);
    return config ? !config.freeOnly : false;
  }

  // === USER LIMITS ===
  getUserLimits(isPremium: boolean) {
    if (isPremium) {
      return {
        maxParticipants: 100,
        maxRegistrations: 50,
        maxFavorites: 100,
        maxActiveEvents: 20
      };
    }
    return {
      maxParticipants: 20,
      maxRegistrations: 10,
      maxFavorites: 10,
      maxActiveEvents: 3
    };
  }

  // === HELPERS ===
  async sendEventReminder(userId: string, eventId: string, eventTitle: string): Promise<Notification> {
    return this.create({
      userId,
      type: 'EVENT_REMINDER',
      title: 'Rappel événement',
      body: `L'événement "${eventTitle}" commence bientôt`,
      relatedEventId: eventId
    });
  }

  async sendNewMessageNotification(userId: string, senderName: string, senderId: string): Promise<Notification> {
    return this.create({
      userId,
      type: 'NEW_MESSAGE',
      title: 'Nouveau message',
      body: `${senderName} vous a envoyé un message`,
      relatedUserId: senderId
    });
  }

  async sendParticipationApproved(userId: string, eventId: string, eventTitle: string): Promise<Notification> {
    return this.create({
      userId,
      type: 'PARTICIPATION_APPROVED',
      title: 'Inscription confirmée',
      body: `Votre inscription à "${eventTitle}" a été validée`,
      relatedEventId: eventId
    });
  }

  async sendProfileVisitNotification(userId: string, visitorId: string, visitorName: string): Promise<Notification> {
    return this.create({
      userId,
      type: 'PROFILE_VISIT',
      title: 'Visite de profil',
      body: `${visitorName} a visité votre profil`,
      relatedUserId: visitorId
    });
  }
}

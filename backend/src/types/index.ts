// Types partagés pour le backend

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type ParticipationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
export type EventCategory = 'SORTIE' | 'SPORT' | 'MUSEE' | 'DANSE' | 'HIKING' | 'DRINKS' | 'OTHER';
export type NotificationType = 'EVENT_REMINDER' | 'NEW_MESSAGE' | 'PARTICIPATION_APPROVED' | 'PARTICIPATION_REJECTED' | 'NEW_PARTICIPANT' | 'EVENT_CANCELLED' | 'PROFILE_VISIT';
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';
export type GroupMemberRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  score?: number;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  eventReminders: boolean;
  messageNotifications: boolean;
  profileVisible: boolean;
  showOnlineStatus: boolean;
  allowMessages: boolean;
  language: string;
  theme: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category: EventCategory;
  date: Date;
  time: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  maxAttendees: number;
  price: number;
  currency: string;
  hideAddressUntilRegistered: boolean;
  requireManualApproval: boolean;
  isCancelled: boolean;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipationStatus;
  registeredAt: Date;
  approvedAt?: Date;
  approvedById?: string;
  cancelledAt?: Date;
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  image?: string;
  description?: string;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: GroupMemberRole;
  joinedAt: Date;
  mutedUntil?: Date;
  isKicked: boolean;
  kickedAt?: Date;
  kickedById?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  conversationId?: string;
  groupId?: string;
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  relatedEventId?: string;
  relatedUserId?: string;
  relatedGroupId?: string;
}

export interface ProfileVisit {
  id: string;
  visitorId: string;
  visitedId: string;
  visitedAt: Date;
}

export interface FeatureConfig {
  key: string;
  value: boolean;
  label: string;
  description?: string;
  category: string;
  freeOnly: boolean;
}

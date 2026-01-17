import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Charger le schema depuis le fichier existant
const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '../../../schema.graphql');

let schemaContent: string;
try {
  schemaContent = readFileSync(schemaPath, 'utf-8');
} catch {
  // Fallback si le fichier n'est pas accessible
  console.warn('schema.graphql not found, using embedded schema');
  schemaContent = getEmbeddedSchema();
}

export const typeDefs = schemaContent;

function getEmbeddedSchema(): string {
  return `#graphql
# ============================================
# SCALARS
# ============================================
scalar DateTime
scalar JSON

# ============================================
# ENUMS
# ============================================

enum UserRole {
  USER
  PREMIUM
  ADMIN
}

enum ParticipationStatus {
  PENDING
  CONFIRMED
  REJECTED
  CANCELLED
}

enum EventCategory {
  SORTIE
  SPORT
  MUSEE
  DANSE
  HIKING
  DRINKS
  OTHER
}

enum NotificationType {
  EVENT_REMINDER
  NEW_MESSAGE
  PARTICIPATION_APPROVED
  PARTICIPATION_REJECTED
  NEW_PARTICIPANT
  EVENT_CANCELLED
  PROFILE_VISIT
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
}

enum GroupMemberRole {
  ADMIN
  MEMBER
}

# ============================================
# TYPES - UTILISATEURS
# ============================================

type User {
  id: ID!
  email: String!
  name: String!
  avatar: String
  bio: String
  score: Float
  role: UserRole!
  isPremium: Boolean!
  isAdmin: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  organizedEvents: [Event!]!
  participations: [Participation!]!
  favoriteEvents: [Event!]!
  groups: [GroupMember!]!
  conversations: [Conversation!]!
  eventsOrganizedCount: Int!
  eventsParticipatedCount: Int!
}

type UserSettings {
  id: ID!
  userId: ID!
  pushNotifications: Boolean!
  emailNotifications: Boolean!
  eventReminders: Boolean!
  messageNotifications: Boolean!
  profileVisible: Boolean!
  showOnlineStatus: Boolean!
  allowMessages: Boolean!
  language: String!
  theme: String!
}

type ProfileVisit {
  id: ID!
  visitor: User!
  visited: User!
  visitedAt: DateTime!
}

# ============================================
# TYPES - ÉVÉNEMENTS
# ============================================

type Event {
  id: ID!
  title: String!
  description: String
  image: String
  category: EventCategory!
  date: DateTime!
  time: String!
  location: String!
  coordinates: Coordinates
  maxAttendees: Int!
  attendeesCount: Int!
  availableSpots: Int!
  price: Float!
  currency: String!
  hideAddressUntilRegistered: Boolean!
  requireManualApproval: Boolean!
  isCancelled: Boolean!
  isFinished: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  organizer: User!
  participations: [Participation!]!
  confirmedParticipants: [User!]!
  pendingParticipants: [User!]!
  group: Group
  favoritedBy: [User!]!
}

type Coordinates {
  latitude: Float!
  longitude: Float!
}

type Participation {
  id: ID!
  user: User!
  event: Event!
  status: ParticipationStatus!
  registeredAt: DateTime!
  approvedAt: DateTime
  cancelledAt: DateTime
  notes: String
}

# ============================================
# TYPES - MESSAGERIE
# ============================================

type Group {
  id: ID!
  name: String!
  image: String
  description: String
  event: Event
  eventId: ID
  members: [GroupMember!]!
  messages: [Message!]!
  memberCount: Int!
  lastMessage: Message
  createdAt: DateTime!
  updatedAt: DateTime!
}

type GroupMember {
  id: ID!
  user: User!
  group: Group!
  role: GroupMemberRole!
  joinedAt: DateTime!
  mutedUntil: DateTime
  isKicked: Boolean!
  kickedAt: DateTime
}

type Conversation {
  id: ID!
  participants: [User!]!
  messages: [Message!]!
  lastMessage: Message
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Message {
  id: ID!
  content: String!
  type: MessageType!
  sender: User!
  conversation: Conversation
  group: Group
  isRead: Boolean!
  readAt: DateTime
  isEdited: Boolean!
  editedAt: DateTime
  isDeleted: Boolean!
  deletedAt: DateTime
  createdAt: DateTime!
}

# ============================================
# TYPES - NOTIFICATIONS
# ============================================

type Notification {
  id: ID!
  user: User!
  type: NotificationType!
  title: String!
  body: String!
  data: JSON
  isRead: Boolean!
  readAt: DateTime
  createdAt: DateTime!
  relatedEvent: Event
  relatedUser: User
  relatedGroup: Group
}

# ============================================
# TYPES - CONFIGURATION
# ============================================

type FeatureConfig {
  key: String!
  value: Boolean!
  label: String!
  description: String
  category: String!
  freeOnly: Boolean!
}

type UserLimits {
  maxParticipants: Int!
  maxRegistrations: Int!
  maxFavorites: Int!
  maxActiveEvents: Int!
}

# ============================================
# TYPES - SUGGESTIONS
# ============================================

type Suggestion {
  id: ID!
  user: User!
  score: Float!
  mutualFriends: [User!]!
  mutualEvents: [Event!]!
  commonInterests: [String!]!
}

# ============================================
# INPUTS
# ============================================

input RegisterInput {
  email: String!
  password: String!
  name: String!
}

input LoginInput {
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  bio: String
  avatar: String
}

input CreateEventInput {
  title: String!
  description: String
  image: String
  category: EventCategory!
  date: DateTime!
  time: String!
  location: String!
  coordinates: CoordinatesInput
  maxAttendees: Int!
  price: Float
  hideAddressUntilRegistered: Boolean
  requireManualApproval: Boolean
}

input UpdateEventInput {
  title: String
  description: String
  image: String
  category: EventCategory
  date: DateTime
  time: String
  location: String
  coordinates: CoordinatesInput
  maxAttendees: Int
  price: Float
  hideAddressUntilRegistered: Boolean
  requireManualApproval: Boolean
}

input CoordinatesInput {
  latitude: Float!
  longitude: Float!
}

input CreateGroupInput {
  name: String!
  image: String
  description: String
  eventId: ID
  memberIds: [ID!]
}

input SendMessageInput {
  content: String!
  type: MessageType
  conversationId: ID
  groupId: ID
}

input UpdateSettingsInput {
  pushNotifications: Boolean
  emailNotifications: Boolean
  eventReminders: Boolean
  messageNotifications: Boolean
  profileVisible: Boolean
  showOnlineStatus: Boolean
  allowMessages: Boolean
  language: String
  theme: String
}

input EventFilters {
  category: EventCategory
  dateFrom: DateTime
  dateTo: DateTime
  location: String
  maxPrice: Float
  hasAvailableSpots: Boolean
  organizerId: ID
}

input PaginationInput {
  limit: Int
  offset: Int
  cursor: String
}

# ============================================
# RESPONSES
# ============================================

type AuthPayload {
  token: String!
  refreshToken: String!
  user: User!
}

type PaginatedEvents {
  items: [Event!]!
  totalCount: Int!
  hasMore: Boolean!
  nextCursor: String
}

type PaginatedUsers {
  items: [User!]!
  totalCount: Int!
  hasMore: Boolean!
  nextCursor: String
}

type PaginatedMessages {
  items: [Message!]!
  totalCount: Int!
  hasMore: Boolean!
  nextCursor: String
}

# ============================================
# QUERIES
# ============================================

type Query {
  me: User!
  mySettings: UserSettings!
  myLimits: UserLimits!
  user(id: ID!): User
  users(search: String, pagination: PaginationInput): PaginatedUsers!
  suggestions(pagination: PaginationInput): [Suggestion!]!
  profileVisitors(pagination: PaginationInput): [ProfileVisit!]!
  event(id: ID!): Event
  events(filters: EventFilters, pagination: PaginationInput): PaginatedEvents!
  trendingEvents(limit: Int): [Event!]!
  myEvents: [Event!]!
  myRegistrations: [Participation!]!
  myFavoriteEvents: [Event!]!
  eventsForDate(date: DateTime!): [Event!]!
  eventParticipants(eventId: ID!, status: ParticipationStatus): [Participation!]!
  pendingApprovals(eventId: ID!): [Participation!]!
  group(id: ID!): Group
  myGroups: [Group!]!
  conversation(id: ID!): Conversation
  conversationWithUser(userId: ID!): Conversation
  myConversations: [Conversation!]!
  groupMessages(groupId: ID!, pagination: PaginationInput): PaginatedMessages!
  conversationMessages(conversationId: ID!, pagination: PaginationInput): PaginatedMessages!
  myNotifications(unreadOnly: Boolean, pagination: PaginationInput): [Notification!]!
  unreadNotificationsCount: Int!
  featureConfig: [FeatureConfig!]!
  isPremiumFeature(feature: String!): Boolean!
}

# ============================================
# MUTATIONS
# ============================================

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  refreshToken(refreshToken: String!): AuthPayload!
  forgotPassword(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
  updateUser(input: UpdateUserInput!): User!
  updateSettings(input: UpdateSettingsInput!): UserSettings!
  deleteAccount: Boolean!
  blockUser(userId: ID!): Boolean!
  unblockUser(userId: ID!): Boolean!
  visitProfile(userId: ID!): ProfileVisit!
  upgradeToPremium(paymentToken: String!): User!
  cancelPremium: User!
  createEvent(input: CreateEventInput!): Event!
  updateEvent(id: ID!, input: UpdateEventInput!): Event!
  deleteEvent(id: ID!): Boolean!
  cancelEvent(id: ID!): Event!
  registerToEvent(eventId: ID!): Participation!
  cancelRegistration(eventId: ID!): Participation!
  approveParticipant(eventId: ID!, userId: ID!): Participation!
  rejectParticipant(eventId: ID!, userId: ID!, reason: String): Participation!
  removeParticipant(eventId: ID!, userId: ID!): Boolean!
  addFavorite(eventId: ID!): Event!
  removeFavorite(eventId: ID!): Event!
  createGroup(input: CreateGroupInput!): Group!
  updateGroup(id: ID!, name: String, image: String, description: String): Group!
  deleteGroup(id: ID!): Boolean!
  joinGroup(groupId: ID!): GroupMember!
  leaveGroup(groupId: ID!): Boolean!
  addGroupMember(groupId: ID!, userId: ID!): GroupMember!
  removeGroupMember(groupId: ID!, userId: ID!): Boolean!
  kickGroupMember(groupId: ID!, userId: ID!): GroupMember!
  promoteToAdmin(groupId: ID!, userId: ID!): GroupMember!
  muteGroup(groupId: ID!, until: DateTime): GroupMember!
  unmuteGroup(groupId: ID!): GroupMember!
  startConversation(userId: ID!): Conversation!
  deleteConversation(id: ID!): Boolean!
  sendMessage(input: SendMessageInput!): Message!
  editMessage(id: ID!, content: String!): Message!
  deleteMessage(id: ID!): Boolean!
  markMessagesAsRead(conversationId: ID, groupId: ID): Boolean!
  markNotificationAsRead(id: ID!): Notification!
  markAllNotificationsAsRead: Boolean!
  deleteNotification(id: ID!): Boolean!
  toggleFeatureFlag(key: String!, value: Boolean!): FeatureConfig!
  banUser(userId: ID!, reason: String): User!
  unbanUser(userId: ID!): User!
  setUserRole(userId: ID!, role: UserRole!): User!
}

# ============================================
# SUBSCRIPTIONS
# ============================================

type Subscription {
  messageReceived(conversationId: ID, groupId: ID): Message!
  messageDeleted(conversationId: ID, groupId: ID): ID!
  notificationReceived: Notification!
  participantJoined(eventId: ID!): Participation!
  participantLeft(eventId: ID!): ID!
  participationStatusChanged(eventId: ID!): Participation!
  eventUpdated(eventId: ID!): Event!
  eventCancelled(eventId: ID!): Event!
  memberJoined(groupId: ID!): GroupMember!
  memberLeft(groupId: ID!): ID!
  memberKicked(groupId: ID!): GroupMember!
  userTyping(conversationId: ID, groupId: ID): User!
  userOnlineStatus(userId: ID!): Boolean!
}
`;
}

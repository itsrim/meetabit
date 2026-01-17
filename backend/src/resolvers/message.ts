import { GraphQLError } from 'graphql';
import type { Context } from '../context.js';
import type { Group, GroupMember, Conversation, Message } from '../types/index.js';

function requireAuth(context: Context) {
  if (!context.user) {
    throw new GraphQLError('Non authentifié', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
  return context.user;
}

export const messageResolvers = {
  Query: {
    group: async (_: unknown, { id }: { id: string }, context: Context) => {
      return context.dataSources.messages.getGroupById(id);
    },

    myGroups: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.getUserGroups(authUser.id);
    },

    conversation: async (_: unknown, { id }: { id: string }, context: Context) => {
      const authUser = requireAuth(context);
      const conversation = await context.dataSources.messages.getConversationById(id);
      
      if (conversation && !conversation.participantIds.includes(authUser.id)) {
        throw new GraphQLError('Non autorisé');
      }
      
      return conversation;
    },

    conversationWithUser: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.getConversationWithUser(authUser.id, userId);
    },

    myConversations: async (_: unknown, __: unknown, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.getUserConversations(authUser.id);
    },

    groupMessages: async (_: unknown, { groupId, pagination }: { groupId: string; pagination?: { limit?: number; offset?: number } }, context: Context) => {
      const authUser = requireAuth(context);
      
      // Vérifier que l'utilisateur est membre du groupe
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const isMember = members.some(m => m.userId === authUser.id);
      
      if (!isMember) {
        throw new GraphQLError('Non membre de ce groupe');
      }

      const { items, totalCount } = await context.dataSources.messages.getGroupMessages(
        groupId,
        pagination?.limit || 50,
        pagination?.offset || 0
      );

      return {
        items,
        totalCount,
        hasMore: (pagination?.offset || 0) + items.length < totalCount,
        nextCursor: null
      };
    },

    conversationMessages: async (_: unknown, { conversationId, pagination }: { conversationId: string; pagination?: { limit?: number; offset?: number } }, context: Context) => {
      const authUser = requireAuth(context);
      
      const conversation = await context.dataSources.messages.getConversationById(conversationId);
      if (!conversation || !conversation.participantIds.includes(authUser.id)) {
        throw new GraphQLError('Non autorisé');
      }

      const { items, totalCount } = await context.dataSources.messages.getConversationMessages(
        conversationId,
        pagination?.limit || 50,
        pagination?.offset || 0
      );

      return {
        items,
        totalCount,
        hasMore: (pagination?.offset || 0) + items.length < totalCount,
        nextCursor: null
      };
    }
  },

  Mutation: {
    createGroup: async (_: unknown, { input }: { input: { name: string; image?: string; description?: string; eventId?: string; memberIds?: string[] } }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.createGroup({
        ...input,
        creatorId: authUser.id
      });
    },

    updateGroup: async (_: unknown, { id, name, image, description }: { id: string; name?: string; image?: string; description?: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      // Vérifier que l'utilisateur est admin du groupe
      const members = await context.dataSources.messages.getGroupMembers(id);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      const updates: Partial<Group> = {};
      if (name !== undefined) updates.name = name;
      if (image !== undefined) updates.image = image;
      if (description !== undefined) updates.description = description;

      return context.dataSources.messages.updateGroup(id, updates);
    },

    deleteGroup: async (_: unknown, { id }: { id: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      const members = await context.dataSources.messages.getGroupMembers(id);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.deleteGroup(id);
    },

    joinGroup: async (_: unknown, { groupId }: { groupId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.addGroupMember(groupId, authUser.id);
    },

    leaveGroup: async (_: unknown, { groupId }: { groupId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.removeGroupMember(groupId, authUser.id);
    },

    addGroupMember: async (_: unknown, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.addGroupMember(groupId, userId);
    },

    removeGroupMember: async (_: unknown, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.removeGroupMember(groupId, userId);
    },

    kickGroupMember: async (_: unknown, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.kickGroupMember(groupId, userId, authUser.id);
    },

    promoteToAdmin: async (_: unknown, { groupId, userId }: { groupId: string; userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member || member.role !== 'ADMIN') {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.promoteToAdmin(groupId, userId);
    },

    muteGroup: async (_: unknown, { groupId, until }: { groupId: string; until?: Date }, context: Context) => {
      const authUser = requireAuth(context);
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member) {
        throw new GraphQLError('Non membre de ce groupe');
      }

      // À implémenter : mettre à jour mutedUntil
      return member;
    },

    unmuteGroup: async (_: unknown, { groupId }: { groupId: string }, context: Context) => {
      const authUser = requireAuth(context);
      const members = await context.dataSources.messages.getGroupMembers(groupId);
      const member = members.find(m => m.userId === authUser.id);
      
      if (!member) {
        throw new GraphQLError('Non membre de ce groupe');
      }

      return member;
    },

    startConversation: async (_: unknown, { userId }: { userId: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.startConversation(authUser.id, userId);
    },

    deleteConversation: async (_: unknown, { id }: { id: string }, context: Context) => {
      const authUser = requireAuth(context);
      const conversation = await context.dataSources.messages.getConversationById(id);
      
      if (!conversation || !conversation.participantIds.includes(authUser.id)) {
        throw new GraphQLError('Non autorisé');
      }

      return context.dataSources.messages.deleteConversation(id);
    },

    sendMessage: async (_: unknown, { input }: { input: { content: string; type?: string; conversationId?: string; groupId?: string } }, context: Context) => {
      const authUser = requireAuth(context);

      if (!input.conversationId && !input.groupId) {
        throw new GraphQLError('conversationId ou groupId requis');
      }

      // Vérifier les permissions
      if (input.conversationId) {
        const conversation = await context.dataSources.messages.getConversationById(input.conversationId);
        if (!conversation || !conversation.participantIds.includes(authUser.id)) {
          throw new GraphQLError('Non autorisé');
        }
      }

      if (input.groupId) {
        const members = await context.dataSources.messages.getGroupMembers(input.groupId);
        const isMember = members.some(m => m.userId === authUser.id && !m.isKicked);
        if (!isMember) {
          throw new GraphQLError('Non membre de ce groupe');
        }
      }

      return context.dataSources.messages.sendMessage({
        ...input,
        type: (input.type as any) || 'TEXT',
        senderId: authUser.id
      });
    },

    editMessage: async (_: unknown, { id, content }: { id: string; content: string }, context: Context) => {
      requireAuth(context);
      return context.dataSources.messages.editMessage(id, content);
    },

    deleteMessage: async (_: unknown, { id }: { id: string }, context: Context) => {
      requireAuth(context);
      return context.dataSources.messages.deleteMessage(id);
    },

    markMessagesAsRead: async (_: unknown, { conversationId, groupId }: { conversationId?: string; groupId?: string }, context: Context) => {
      const authUser = requireAuth(context);
      return context.dataSources.messages.markAsRead(conversationId, groupId, authUser.id);
    }
  },

  Group: {
    event: async (group: Group, _: unknown, context: Context) => {
      if (!group.eventId) return null;
      return context.dataSources.events.getById(group.eventId);
    },

    members: async (group: Group, _: unknown, context: Context) => {
      return context.dataSources.messages.getGroupMembers(group.id);
    },

    messages: async (group: Group, _: unknown, context: Context) => {
      const { items } = await context.dataSources.messages.getGroupMessages(group.id, 50, 0);
      return items;
    },

    memberCount: async (group: Group, _: unknown, context: Context) => {
      const members = await context.dataSources.messages.getGroupMembers(group.id);
      return members.length;
    },

    lastMessage: (group: Group, _: unknown, context: Context) => {
      return context.dataSources.messages.getLastMessage(undefined, group.id);
    },

    unreadCount: (group: Group, { userId }: { userId: string }, context: Context) => {
      return context.dataSources.messages.getUnreadCount(undefined, group.id, userId);
    }
  },

  GroupMember: {
    user: async (member: GroupMember, _: unknown, context: Context) => {
      return context.dataSources.users.getById(member.userId);
    },

    group: async (member: GroupMember, _: unknown, context: Context) => {
      return context.dataSources.messages.getGroupById(member.groupId);
    },

    kickedBy: async (member: GroupMember, _: unknown, context: Context) => {
      if (!member.kickedById) return null;
      return context.dataSources.users.getById(member.kickedById);
    }
  },

  Conversation: {
    participants: async (conversation: Conversation, _: unknown, context: Context) => {
      const users = await Promise.all(
        conversation.participantIds.map(id => context.dataSources.users.getById(id))
      );
      return users.filter(Boolean);
    },

    messages: async (conversation: Conversation, _: unknown, context: Context) => {
      const { items } = await context.dataSources.messages.getConversationMessages(conversation.id, 50, 0);
      return items;
    },

    lastMessage: (conversation: Conversation, _: unknown, context: Context) => {
      return context.dataSources.messages.getLastMessage(conversation.id);
    },

    unreadCount: (conversation: Conversation, { userId }: { userId: string }, context: Context) => {
      return context.dataSources.messages.getUnreadCount(conversation.id, undefined, userId);
    },

    otherParticipant: async (conversation: Conversation, { userId }: { userId: string }, context: Context) => {
      const otherId = conversation.participantIds.find(id => id !== userId);
      if (!otherId) return null;
      return context.dataSources.users.getById(otherId);
    }
  },

  Message: {
    sender: async (message: Message, _: unknown, context: Context) => {
      return context.dataSources.users.getById(message.senderId);
    },

    conversation: async (message: Message, _: unknown, context: Context) => {
      if (!message.conversationId) return null;
      return context.dataSources.messages.getConversationById(message.conversationId);
    },

    group: async (message: Message, _: unknown, context: Context) => {
      if (!message.groupId) return null;
      return context.dataSources.messages.getGroupById(message.groupId);
    }
  }
};

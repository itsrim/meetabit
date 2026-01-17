import { v4 as uuid } from 'uuid';
import type { Group, GroupMember, Conversation, Message, MessageType, GroupMemberRole } from '../types/index.js';

// Base de données en mémoire (mock)
const groups: Map<string, Group> = new Map();
const groupMembers: Map<string, GroupMember> = new Map();
const conversations: Map<string, Conversation> = new Map();
const messages: Message[] = [];

// Données initiales
function initMockData() {
  // Créer un groupe de discussion
  const group: Group = {
    id: '1',
    name: 'Randonneurs du dimanche',
    image: 'https://picsum.photos/seed/group1/200',
    description: 'Groupe pour organiser nos randonnées',
    eventId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  groups.set(group.id, group);

  // Ajouter des membres
  ['1', '2', '3'].forEach((userId, index) => {
    const member: GroupMember = {
      id: uuid(),
      userId,
      groupId: '1',
      role: index === 0 ? 'ADMIN' : 'MEMBER',
      joinedAt: new Date(),
      isKicked: false
    };
    groupMembers.set(member.id, member);
  });

  // Créer une conversation privée
  const conversation: Conversation = {
    id: '1',
    participantIds: ['1', '2'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  conversations.set(conversation.id, conversation);

  // Ajouter quelques messages
  const mockMessages: Partial<Message>[] = [
    { senderId: '1', content: 'Salut ! Tu viens à la randonnée dimanche ?', conversationId: '1' },
    { senderId: '2', content: 'Oui bien sûr ! À quelle heure on se retrouve ?', conversationId: '1' },
    { senderId: '1', content: 'On dit 9h au parking ?', conversationId: '1' },
    { senderId: '1', content: 'Bienvenue dans le groupe !', groupId: '1' },
    { senderId: '2', content: 'Merci ! Content d\'être là', groupId: '1' }
  ];

  mockMessages.forEach((msg, i) => {
    const message: Message = {
      id: uuid(),
      content: msg.content!,
      type: 'TEXT',
      senderId: msg.senderId!,
      conversationId: msg.conversationId,
      groupId: msg.groupId,
      isRead: true,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(Date.now() - (mockMessages.length - i) * 60000)
    };
    messages.push(message);
  });
}

initMockData();

export class MessageDataSource {
  // === GROUPS ===
  async getGroupById(id: string): Promise<Group | null> {
    return groups.get(id) || null;
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const memberGroups = Array.from(groupMembers.values())
      .filter(m => m.userId === userId && !m.isKicked)
      .map(m => m.groupId);
    return memberGroups.map(id => groups.get(id)).filter(Boolean) as Group[];
  }

  async createGroup(data: { name: string; image?: string; description?: string; eventId?: string; creatorId: string; memberIds?: string[] }): Promise<Group> {
    const group: Group = {
      id: uuid(),
      name: data.name,
      image: data.image,
      description: data.description,
      eventId: data.eventId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    groups.set(group.id, group);

    // Ajouter le créateur comme admin
    const adminMember: GroupMember = {
      id: uuid(),
      userId: data.creatorId,
      groupId: group.id,
      role: 'ADMIN',
      joinedAt: new Date(),
      isKicked: false
    };
    groupMembers.set(adminMember.id, adminMember);

    // Ajouter les autres membres
    if (data.memberIds) {
      for (const userId of data.memberIds) {
        if (userId !== data.creatorId) {
          const member: GroupMember = {
            id: uuid(),
            userId,
            groupId: group.id,
            role: 'MEMBER',
            joinedAt: new Date(),
            isKicked: false
          };
          groupMembers.set(member.id, member);
        }
      }
    }

    return group;
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group> {
    const group = groups.get(id);
    if (!group) {
      throw new Error('Groupe non trouvé');
    }
    const updated = { ...group, ...data, updatedAt: new Date() };
    groups.set(id, updated);
    return updated;
  }

  async deleteGroup(id: string): Promise<boolean> {
    return groups.delete(id);
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return Array.from(groupMembers.values())
      .filter(m => m.groupId === groupId && !m.isKicked);
  }

  async addGroupMember(groupId: string, userId: string, role: GroupMemberRole = 'MEMBER'): Promise<GroupMember> {
    const existing = Array.from(groupMembers.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    
    if (existing && !existing.isKicked) {
      throw new Error('Utilisateur déjà membre du groupe');
    }

    if (existing && existing.isKicked) {
      // Réintégrer le membre
      const updated = { ...existing, isKicked: false, kickedAt: undefined, kickedById: undefined };
      groupMembers.set(existing.id, updated);
      return updated;
    }

    const member: GroupMember = {
      id: uuid(),
      userId,
      groupId,
      role,
      joinedAt: new Date(),
      isKicked: false
    };
    groupMembers.set(member.id, member);
    return member;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    const member = Array.from(groupMembers.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    if (member) {
      groupMembers.delete(member.id);
      return true;
    }
    return false;
  }

  async kickGroupMember(groupId: string, userId: string, kickedById: string): Promise<GroupMember> {
    const member = Array.from(groupMembers.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    if (!member) {
      throw new Error('Membre non trouvé');
    }
    const updated = { ...member, isKicked: true, kickedAt: new Date(), kickedById };
    groupMembers.set(member.id, updated);
    return updated;
  }

  async promoteToAdmin(groupId: string, userId: string): Promise<GroupMember> {
    const member = Array.from(groupMembers.values())
      .find(m => m.groupId === groupId && m.userId === userId);
    if (!member) {
      throw new Error('Membre non trouvé');
    }
    const updated = { ...member, role: 'ADMIN' as GroupMemberRole };
    groupMembers.set(member.id, updated);
    return updated;
  }

  // === CONVERSATIONS ===
  async getConversationById(id: string): Promise<Conversation | null> {
    return conversations.get(id) || null;
  }

  async getConversationWithUser(userId: string, otherUserId: string): Promise<Conversation | null> {
    return Array.from(conversations.values()).find(c => 
      c.participantIds.includes(userId) && c.participantIds.includes(otherUserId)
    ) || null;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return Array.from(conversations.values())
      .filter(c => c.participantIds.includes(userId))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async startConversation(userId: string, otherUserId: string): Promise<Conversation> {
    // Vérifier si une conversation existe déjà
    const existing = await this.getConversationWithUser(userId, otherUserId);
    if (existing) {
      return existing;
    }

    const conversation: Conversation = {
      id: uuid(),
      participantIds: [userId, otherUserId],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    conversations.set(conversation.id, conversation);
    return conversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return conversations.delete(id);
  }

  // === MESSAGES ===
  async sendMessage(data: { content: string; type?: MessageType; senderId: string; conversationId?: string; groupId?: string }): Promise<Message> {
    const message: Message = {
      id: uuid(),
      content: data.content,
      type: data.type || 'TEXT',
      senderId: data.senderId,
      conversationId: data.conversationId,
      groupId: data.groupId,
      isRead: false,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date()
    };
    messages.push(message);

    // Mettre à jour la date de la conversation/groupe
    if (data.conversationId) {
      const conv = conversations.get(data.conversationId);
      if (conv) {
        conversations.set(conv.id, { ...conv, updatedAt: new Date() });
      }
    }
    if (data.groupId) {
      const group = groups.get(data.groupId);
      if (group) {
        groups.set(group.id, { ...group, updatedAt: new Date() });
      }
    }

    return message;
  }

  async editMessage(id: string, content: string): Promise<Message> {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Message non trouvé');
    }
    messages[index] = {
      ...messages[index],
      content,
      isEdited: true,
      editedAt: new Date()
    };
    return messages[index];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return false;
    messages[index] = {
      ...messages[index],
      isDeleted: true,
      deletedAt: new Date()
    };
    return true;
  }

  async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<{ items: Message[]; totalCount: number }> {
    const items = messages
      .filter(m => m.conversationId === conversationId && !m.isDeleted)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return {
      items: items.slice(offset, offset + limit),
      totalCount: items.length
    };
  }

  async getGroupMessages(groupId: string, limit = 50, offset = 0): Promise<{ items: Message[]; totalCount: number }> {
    const items = messages
      .filter(m => m.groupId === groupId && !m.isDeleted)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return {
      items: items.slice(offset, offset + limit),
      totalCount: items.length
    };
  }

  async markAsRead(conversationId?: string, groupId?: string, userId?: string): Promise<boolean> {
    messages.forEach((m, i) => {
      if (m.senderId !== userId) {
        if ((conversationId && m.conversationId === conversationId) ||
            (groupId && m.groupId === groupId)) {
          messages[i] = { ...m, isRead: true, readAt: new Date() };
        }
      }
    });
    return true;
  }

  getLastMessage(conversationId?: string, groupId?: string): Message | null {
    const filtered = messages.filter(m => 
      !m.isDeleted && 
      ((conversationId && m.conversationId === conversationId) ||
       (groupId && m.groupId === groupId))
    );
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  getUnreadCount(conversationId?: string, groupId?: string, userId?: string): number {
    return messages.filter(m => 
      !m.isDeleted && 
      !m.isRead &&
      m.senderId !== userId &&
      ((conversationId && m.conversationId === conversationId) ||
       (groupId && m.groupId === groupId))
    ).length;
  }
}

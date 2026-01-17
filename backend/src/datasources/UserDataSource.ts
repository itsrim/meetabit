import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User, UserSettings, ProfileVisit } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Base de données en mémoire (mock)
const users: Map<string, User> = new Map();
const settings: Map<string, UserSettings> = new Map();
const visits: ProfileVisit[] = [];
const blockedUsers: Map<string, Set<string>> = new Map();

// Données initiales
function initMockData() {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'alice@example.com',
      name: 'Alice Martin',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      bio: 'Passionnée de randonnée et de musique',
      score: 4.8,
      role: 'PREMIUM',
      passwordHash: bcrypt.hashSync('password123', 10),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      email: 'bob@example.com',
      name: 'Bob Dupont',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      bio: 'Amateur de sport et sorties culturelles',
      score: 4.5,
      role: 'USER',
      passwordHash: bcrypt.hashSync('password123', 10),
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date()
    },
    {
      id: '3',
      email: 'claire@example.com',
      name: 'Claire Bernard',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      bio: 'Organisatrice d\'événements, toujours partante !',
      score: 4.9,
      role: 'ADMIN',
      passwordHash: bcrypt.hashSync('password123', 10),
      createdAt: new Date('2023-06-01'),
      updatedAt: new Date()
    }
  ];

  mockUsers.forEach(user => {
    users.set(user.id, user);
    settings.set(user.id, {
      id: uuid(),
      userId: user.id,
      pushNotifications: true,
      emailNotifications: true,
      eventReminders: true,
      messageNotifications: true,
      profileVisible: true,
      showOnlineStatus: true,
      allowMessages: true,
      language: 'fr',
      theme: 'dark'
    });
  });
}

initMockData();

export class UserDataSource {
  // === AUTH ===
  async register(email: string, password: string, name: string): Promise<{ token: string; refreshToken: string; user: User }> {
    // Vérifier si l'email existe déjà
    const existing = Array.from(users.values()).find(u => u.email === email);
    if (existing) {
      throw new Error('Cet email est déjà utilisé');
    }

    const id = uuid();
    const user: User = {
      id,
      email,
      name,
      role: 'USER',
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(id, user);
    settings.set(id, {
      id: uuid(),
      userId: id,
      pushNotifications: true,
      emailNotifications: true,
      eventReminders: true,
      messageNotifications: true,
      profileVisible: true,
      showOnlineStatus: true,
      allowMessages: true,
      language: 'fr',
      theme: 'dark'
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });

    return { token, refreshToken, user };
  }

  async login(email: string, password: string): Promise<{ token: string; refreshToken: string; user: User }> {
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '30d' });

    return { token, refreshToken, user };
  }

  // === QUERIES ===
  async getById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    return Array.from(users.values()).find(u => u.email === email) || null;
  }

  async getAll(search?: string, limit = 20, offset = 0): Promise<{ items: User[]; totalCount: number }> {
    let items = Array.from(users.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(u => 
        u.name.toLowerCase().includes(searchLower) || 
        u.email.toLowerCase().includes(searchLower)
      );
    }

    const totalCount = items.length;
    items = items.slice(offset, offset + limit);

    return { items, totalCount };
  }

  async getSettings(userId: string): Promise<UserSettings | null> {
    return settings.get(userId) || null;
  }

  // === MUTATIONS ===
  async update(id: string, data: Partial<User>): Promise<User> {
    const user = users.get(id);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const updated = { ...user, ...data, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  }

  async updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    const current = settings.get(userId);
    if (!current) {
      throw new Error('Paramètres non trouvés');
    }

    const updated = { ...current, ...data };
    settings.set(userId, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return users.delete(id) && settings.delete(id);
  }

  async upgradeToPremium(id: string): Promise<User> {
    return this.update(id, { role: 'PREMIUM' });
  }

  async cancelPremium(id: string): Promise<User> {
    return this.update(id, { role: 'USER' });
  }

  // === PROFILE VISITS ===
  async visitProfile(visitorId: string, visitedId: string): Promise<ProfileVisit> {
    const visit: ProfileVisit = {
      id: uuid(),
      visitorId,
      visitedId,
      visitedAt: new Date()
    };
    visits.push(visit);
    return visit;
  }

  async getProfileVisitors(userId: string, limit = 20, offset = 0): Promise<ProfileVisit[]> {
    return visits
      .filter(v => v.visitedId === userId)
      .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime())
      .slice(offset, offset + limit);
  }

  // === BLOCKING ===
  async blockUser(userId: string, blockedId: string): Promise<boolean> {
    if (!blockedUsers.has(userId)) {
      blockedUsers.set(userId, new Set());
    }
    blockedUsers.get(userId)!.add(blockedId);
    return true;
  }

  async unblockUser(userId: string, blockedId: string): Promise<boolean> {
    const blocked = blockedUsers.get(userId);
    if (blocked) {
      blocked.delete(blockedId);
    }
    return true;
  }

  async getBlockedUsers(userId: string): Promise<User[]> {
    const blocked = blockedUsers.get(userId);
    if (!blocked) return [];
    return Array.from(blocked).map(id => users.get(id)).filter(Boolean) as User[];
  }

  // === HELPERS ===
  isPremium(user: User): boolean {
    return user.role === 'PREMIUM' || user.role === 'ADMIN';
  }

  isAdmin(user: User): boolean {
    return user.role === 'ADMIN';
  }
}

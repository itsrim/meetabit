import { StandaloneServerContextFnArg } from '@apollo/server/standalone';
import jwt from 'jsonwebtoken';
import { UserDataSource } from './datasources/UserDataSource.js';
import { EventDataSource } from './datasources/EventDataSource.js';
import { MessageDataSource } from './datasources/MessageDataSource.js';
import { NotificationDataSource } from './datasources/NotificationDataSource.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'PREMIUM' | 'ADMIN';
}

export interface Context {
  user: AuthUser | null;
  dataSources: {
    users: UserDataSource;
    events: EventDataSource;
    messages: MessageDataSource;
    notifications: NotificationDataSource;
  };
}

export async function createContext({ req }: StandaloneServerContextFnArg): Promise<Context> {
  let user: AuthUser | null = null;
  
  // Extraire le token du header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      user = decoded;
    } catch {
      // Token invalide - on continue sans authentification
      console.warn('Invalid token provided');
    }
  }

  // Créer les data sources
  const dataSources = {
    users: new UserDataSource(),
    events: new EventDataSource(),
    messages: new MessageDataSource(),
    notifications: new NotificationDataSource()
  };

  return { user, dataSources };
}

import { GraphQLScalarType, Kind } from 'graphql';
import { userResolvers } from './user.js';
import { eventResolvers } from './event.js';
import { messageResolvers } from './message.js';
import { notificationResolvers } from './notification.js';

// Scalar personnalisé pour DateTime
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('DateTime cannot represent non-Date type');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    throw new Error('DateTime cannot be parsed from non-string/number type');
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.kind === Kind.STRING ? ast.value : parseInt(ast.value, 10));
    }
    throw new Error('DateTime cannot represent non-string/int type');
  }
});

// Scalar JSON
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: unknown): unknown {
    return value;
  },
  parseValue(value: unknown): unknown {
    return value;
  },
  parseLiteral(ast): unknown {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch {
        return ast.value;
      }
    }
    return null;
  }
});

// Merger tous les resolvers
export const resolvers = {
  DateTime: dateTimeScalar,
  JSON: jsonScalar,
  
  Query: {
    ...userResolvers.Query,
    ...eventResolvers.Query,
    ...messageResolvers.Query,
    ...notificationResolvers.Query
  },
  
  Mutation: {
    ...userResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...notificationResolvers.Mutation
  },
  
  // Type resolvers
  User: userResolvers.User,
  Event: eventResolvers.Event,
  Participation: eventResolvers.Participation,
  Group: messageResolvers.Group,
  GroupMember: messageResolvers.GroupMember,
  Conversation: messageResolvers.Conversation,
  Message: messageResolvers.Message,
  Notification: notificationResolvers.Notification
};

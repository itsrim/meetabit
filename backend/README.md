# Backend GraphQL - Application Événements

Backend Node.js avec Apollo Server 4 et TypeScript.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement (hot reload)
npm run dev

# Build pour production
npm run build

# Démarrage en production
npm start
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── context.ts            # Contexte Apollo (auth, datasources)
│   ├── types/
│   │   └── index.ts          # Types TypeScript partagés
│   ├── schema/
│   │   └── typeDefs.ts       # Définitions GraphQL
│   ├── resolvers/
│   │   ├── index.ts          # Merger des resolvers
│   │   ├── user.ts           # Resolvers utilisateurs
│   │   ├── event.ts          # Resolvers événements
│   │   ├── message.ts        # Resolvers messagerie
│   │   └── notification.ts   # Resolvers notifications
│   └── datasources/
│       ├── UserDataSource.ts
│       ├── EventDataSource.ts
│       ├── MessageDataSource.ts
│       └── NotificationDataSource.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du dossier backend :

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=votre-secret-jwt-super-securise
JWT_EXPIRES_IN=7d
```

## 🌐 API GraphQL

Une fois le serveur démarré, accédez au playground GraphQL :

- **URL**: http://localhost:4000
- **Playground GraphQL**: Intégré dans Apollo Server 4

### Exemples de requêtes

#### Authentification

```graphql
# Inscription
mutation Register {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    token
    refreshToken
    user {
      id
      name
      email
    }
  }
}

# Connexion
mutation Login {
  login(input: {
    email: "alice@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      name
      isPremium
    }
  }
}
```

#### Événements

```graphql
# Liste des événements
query Events {
  events(pagination: { limit: 10 }) {
    items {
      id
      title
      date
      location
      attendeesCount
      organizer {
        name
      }
    }
    totalCount
    hasMore
  }
}

# Créer un événement (authentifié)
mutation CreateEvent {
  createEvent(input: {
    title: "Randonnée du dimanche"
    description: "Belle balade en montagne"
    category: HIKING
    date: "2026-02-01T09:00:00Z"
    time: "09:00"
    location: "Chamonix, France"
    maxAttendees: 15
    price: 0
  }) {
    id
    title
  }
}
```

#### Messagerie

```graphql
# Mes conversations
query MyConversations {
  myConversations {
    id
    lastMessage {
      content
      createdAt
    }
    participants {
      name
      avatar
    }
  }
}

# Envoyer un message
mutation SendMessage {
  sendMessage(input: {
    content: "Salut !"
    conversationId: "1"
  }) {
    id
    content
    createdAt
  }
}
```

## 🔐 Authentification

Les requêtes authentifiées nécessitent un header `Authorization` :

```
Authorization: Bearer <token>
```

## 📊 Base de données

Actuellement, le backend utilise une base de données **en mémoire** (mock) pour le développement. Les données sont réinitialisées à chaque redémarrage.

Pour une version production, il faudrait :
1. Remplacer les DataSources par de vrais connecteurs (PostgreSQL, MongoDB, etc.)
2. Utiliser un ORM comme Prisma ou TypeORM

## 🧪 Utilisateurs de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| alice@example.com | password123 | PREMIUM |
| bob@example.com | password123 | USER |
| claire@example.com | password123 | ADMIN |

## 📝 Scripts

- `npm run dev` - Démarrage en mode développement avec hot reload
- `npm run build` - Compilation TypeScript
- `npm start` - Démarrage en production
- `npm run lint` - Linting du code

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **TypeScript** - Typage statique
- **Apollo Server 4** - Serveur GraphQL
- **GraphQL** - Langage de requête
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe

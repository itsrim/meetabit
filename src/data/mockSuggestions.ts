export interface Suggestion {
    id: number;
    name: string;
    age: number;
    image: string;
    height: number;
    rotation: number;
    offset: number;
}

const FIRST_NAMES = [
    'Maya', 'Nancy', 'Kat', 'Stacey', 'Zoe', 'Lily', 'Rose', 'Emma', 'Sophie', 'Clara',
    'Léa', 'Manon', 'Chloé', 'Camille', 'Sarah', 'Laura', 'Julie', 'Marie', 'Anna', 'Eva',
    'Jade', 'Louise', 'Alice', 'Lola', 'Inès', 'Léna', 'Lucie', 'Nina', 'Mia', 'Zoé',
    'Lucas', 'Hugo', 'Louis', 'Nathan', 'Gabriel', 'Jules', 'Adam', 'Raphaël', 'Arthur', 'Léo',
    'Noah', 'Ethan', 'Paul', 'Tom', 'Mathis', 'Théo', 'Maxime', 'Alexandre', 'Antoine', 'Victor'
];

export const SUGGESTIONS: Suggestion[] = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: FIRST_NAMES[i % FIRST_NAMES.length],
    age: 18 + (i % 20),
    image: `https://i.pravatar.cc/600?img=${(i % 70) + 1}`,
    height: 200 + (i % 5) * 30,
    rotation: ((i * 7) % 13) - 6,
    offset: (i * 11) % 45
}));

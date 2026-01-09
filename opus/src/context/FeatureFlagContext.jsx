import React, { createContext, useContext, useState, useEffect } from 'react';

const FeatureFlagContext = createContext();

// Configuration Premium vs Free
const DEFAULT_CONFIG = {
    isPremium: {
        value: false,
        label: '✨ Mode Premium',
        description: 'Débloquer toutes les fonctionnalités',
        category: 'Compte',
        isToggle: true
    },
    // Restrictions Free (inversées - true = restriction active)
    blurProfiles: {
        value: true,
        label: 'Profils floutés',
        description: 'Photos, noms et âges des utilisateurs floutés',
        category: 'Restrictions Free',
        freeOnly: true
    },
    disableMessages: {
        value: true,
        label: 'Messages désactivés',
        description: 'Onglet Messages non accessible',
        category: 'Restrictions Free',
        freeOnly: true
    },
    blurEventAddress: {
        value: false,
        label: 'Adresses floutées (obsolète)',
        description: 'Géré par l\'organisateur de chaque événement',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitEventCreation: {
        value: true,
        label: 'Création limitée (1 événement)',
        description: 'Maximum 1 événement actif à la fois',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitParticipants: {
        value: true,
        label: 'Participants limités (8 max)',
        description: 'Premium: jusqu\'à 20 participants',
        category: 'Restrictions Free',
        freeOnly: true
    },
    limitRegistrations: {
        value: true,
        label: 'Inscriptions limitées (3 max)',
        description: 'Max 3 participations et 3 favoris. Premium: 10',
        category: 'Restrictions Free',
        freeOnly: true
    },
    disableSearch: {
        value: true,
        label: 'Recherche désactivée',
        description: 'La recherche d\'événements est réservée aux Premium',
        category: 'Restrictions Free',
        freeOnly: true
    }
};

// Limites selon le statut
const LIMITS = {
    free: {
        maxParticipants: 8,
        maxRegistrations: 3,
        maxFavorites: 3,
        maxActiveEvents: 1
    },
    premium: {
        maxParticipants: 20,
        maxRegistrations: 10,
        maxFavorites: 10,
        maxActiveEvents: 999
    }
};

export const FeatureFlagProvider = ({ children }) => {
    // Charger la config depuis localStorage ou utiliser les valeurs par défaut
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('appConfig');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const merged = { ...DEFAULT_CONFIG };
                Object.keys(parsed).forEach(key => {
                    if (merged[key]) {
                        merged[key] = { ...merged[key], value: parsed[key].value };
                    }
                });
                return merged;
            } catch {
                return DEFAULT_CONFIG;
            }
        }
        return DEFAULT_CONFIG;
    });

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('appConfig', JSON.stringify(config));
    }, [config]);

    const isPremium = config.isPremium.value;

    // Toggle une config
    const toggleConfig = (configKey) => {
        setConfig(prev => ({
            ...prev,
            [configKey]: {
                ...prev[configKey],
                value: !prev[configKey].value
            }
        }));
    };

    // Vérifier si une restriction est active (prend en compte le premium)
    const isRestricted = (configKey) => {
        if (isPremium) return false; // Premium = pas de restriction
        return config[configKey]?.value ?? false;
    };

    // Obtenir les limites actuelles selon le statut premium
    const getLimits = () => {
        return isPremium ? LIMITS.premium : LIMITS.free;
    };

    // Obtenir la config groupée par catégorie
    const getConfigByCategory = () => {
        const categories = {};
        Object.entries(config).forEach(([key, item]) => {
            const category = item.category || 'Autres';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push({ key, ...item });
        });
        return categories;
    };

    // Reset toute la config aux valeurs par défaut
    const resetConfig = () => {
        setConfig(DEFAULT_CONFIG);
    };

    // Compatibilité avec l'ancien système
    const isEnabled = (flagKey) => {
        // Pour les anciens flags, retourner true par défaut
        if (flagKey === 'favoriteButton') return true;
        if (flagKey === 'showEventPrice') return true;
        if (flagKey === 'showAttendeeCount') return true;
        return !isRestricted(flagKey);
    };

    return (
        <FeatureFlagContext.Provider value={{
            config,
            isPremium,
            toggleConfig,
            isRestricted,
            getLimits,
            getConfigByCategory,
            resetConfig,
            // Compatibilité
            isEnabled,
            flags: config,
            toggleFlag: toggleConfig,
            getFlagsByCategory: getConfigByCategory,
            resetFlags: resetConfig
        }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => {
    const context = useContext(FeatureFlagContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};

export default FeatureFlagContext;


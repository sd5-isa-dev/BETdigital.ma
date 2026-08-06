type PLAN = {
    id: string;
    title: string;
    category: "Résidentiel" | "Industriel" | "Tertiaire" | "Infrastructure";
    location: string;
    surface: string;
    mission: string;
    year: string;
    description: string;
    // Placeholder until real photos are available — see ImagePlaceholder in pricing.tsx
    image?: string;
    featured?: boolean;
};

export const PLANS: PLAN[] = [
    {
        id: "al-amal",
        title: "Résidence Al Amal",
        category: "Résidentiel",
        location: "Casablanca",
        surface: "4 500 m²",
        mission: "Étude béton armé & VRD",
        year: "2025",
        description: "Conception structurelle complète d'un ensemble R+6 avec sous-sol parking, avec suivi BIM du chantier jusqu'à la livraison.",
        featured: true
    },
    {
        id: "zone-industrielle-nord",
        title: "Zone Industrielle Nord",
        category: "Industriel",
        location: "Meknès",
        surface: "12 000 m²",
        mission: "Structure métallique & note de calcul",
        year: "2024",
        description: "Dimensionnement de la charpente métallique et des fondations pour un hangar logistique multi-cellules."
    },
    {
        id: "lotissement-cedres",
        title: "Lotissement Les Cèdres",
        category: "Résidentiel",
        location: "Fès",
        surface: "8 000 m²",
        mission: "VRD & levé topographique",
        year: "2024",
        description: "Étude complète de voirie, réseaux divers et assainissement pour un lotissement de 42 lots."
    },
    {
        id: "techpark-siege",
        title: "Siège Social TechPark",
        category: "Tertiaire",
        location: "Rabat",
        surface: "2 800 m²",
        mission: "Modélisation BIM & suivi de chantier",
        year: "2025",
        description: "Coordination BIM tous corps d'état pour un immeuble de bureaux R+5 à haute performance énergétique."
    },
    {
        id: "pont-rn8",
        title: "Ouvrage d'Art RN8",
        category: "Infrastructure",
        location: "Meknès",
        surface: "180 ml",
        mission: "Étude d'ouvrage d'art",
        year: "2023",
        description: "Calcul de structure et vérification sismique d'un pont routier franchissant l'oued, en lien avec les autorités locales."
    },
    {
        id: "ecole-al-fath",
        title: "Complexe Scolaire Al Fath",
        category: "Tertiaire",
        location: "Meknès",
        surface: "3 600 m²",
        mission: "Étude structure & contrôle technique",
        year: "2024",
        description: "Dimensionnement parasismique et contrôle technique d'un groupe scolaire de 24 salles de classe."
    }
];
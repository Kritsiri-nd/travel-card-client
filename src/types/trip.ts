export type Trip = {
    id: number;
    title: string;
    description: string;
    photos?: string[];
    tags?: string[];
    latitude?: number;
    longitude?: number;
    createdAt?: string;
    updatedAt?: string;
    author?: {
        name: string;
        avatarUrl?: string;
        bio?: string;
    };
};

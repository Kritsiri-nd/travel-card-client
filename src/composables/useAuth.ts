import { ref, computed } from "vue";

export interface AuthUser {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const token = ref<string | null>(localStorage.getItem("travelapp_token"));
const currentUser = ref<AuthUser | null>(null);
const isFetchingUser = ref(false);

const setToken = (value: string | null) => {
    token.value = value;
    if (value) {
        localStorage.setItem("travelapp_token", value);
    } else {
        localStorage.removeItem("travelapp_token");
    }
};

const fetchCurrentUser = async () => {
    if (!token.value) {
        currentUser.value = null;
        return;
    }

    isFetchingUser.value = true;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token.value}` }
        });

        if (!response.ok) {
            throw new Error("unauthorized");
        }

        currentUser.value = await response.json();
    } catch (err) {
        console.error("Failed to fetch current user", err);
        setToken(null);
        currentUser.value = null;
    } finally {
        isFetchingUser.value = false;
    }
};

const logout = () => {
    setToken(null);
    currentUser.value = null;
};

if (token.value) {
    fetchCurrentUser();
}

export default function useAuth() {
    return {
        token,
        user: currentUser,
        isAuthenticated: computed(() => !!currentUser.value),
        isFetchingUser,
        setToken,
        fetchCurrentUser,
        logout
    };
}

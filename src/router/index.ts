import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Auth from "../views/Auth.vue";
import OAuthCallback from "../views/OAuthCallback.vue";
import TripDetails from "../views/TripDetails.vue"; // Added import for TripDetails

const routes = [
    { path: "/", name: "home", component: Home },
    { path: "/login", name: "login", component: Auth },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth.vue') // Changed to dynamic import as per instruction's code edit
    },
    {
      path: '/trips/:id',
      name: 'trip-details',
      component: () => import('../views/TripDetails.vue') // Added TripDetails route
    },
    { path: "/auth/callback", name: "auth-callback", component: OAuthCallback },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

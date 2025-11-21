import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Auth from "../views/Auth.vue";
import OAuthCallback from "../views/OAuthCallback.vue";

const routes = [
    { path: "/", name: "home", component: Home },
    { path: "/login", name: "login", component: Auth },
    { path: "/register", name: "register", component: Auth },
    { path: "/auth/callback", name: "auth-callback", component: OAuthCallback },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

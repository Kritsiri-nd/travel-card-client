import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import OAuthCallback from "../views/OAuthCallback.vue";

const routes = [
    { path: "/", name: "home", component: Home },
    { path: "/login", name: "login", component: Login },
    { path: "/auth/callback", name: "auth-callback", component: OAuthCallback },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

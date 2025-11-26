import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Auth from "../views/Auth.vue";
import OAuthCallback from "../views/OAuthCallback.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Auth },

  {
    path: "/trips/:id",
    name: "trip-details",
    component: () => import("../views/TripDetails.vue"),
  },
  {
    path: "/my-trips",
    name: "my-trips",
    component: () => import("../views/MyTrips.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/auth/callback", name: "auth-callback", component: OAuthCallback },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

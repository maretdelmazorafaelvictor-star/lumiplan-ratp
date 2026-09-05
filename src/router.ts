import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue";
import { REALTIME_API_ENABLED } from "./config";
import Screen from "./pages/Screen.vue";
import Editor from "./pages/Editor.vue";

const routes = [
  REALTIME_API_ENABLED
    ? { path: "/", component: Home }
    : { path: "/", redirect: "/editor" },
  { path: "/home", component: Home },
  {
    name: "DesserteDetails",
    path: "/screen/:line?/:trip?",
    component: Screen,
  },
  {
    name: "Editor",
    path: "/editor/:line?/:trip?",
    component: Editor,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;

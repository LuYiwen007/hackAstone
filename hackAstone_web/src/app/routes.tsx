import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Disciplines } from "./pages/Disciplines";
import { Battle } from "./pages/Battle";
import { MindProfile } from "./pages/MindProfile";
import { PhilosophyBattle } from "./pages/PhilosophyBattle";
import { RoundtableDebate } from "./pages/RoundtableDebate";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/disciplines",
    Component: Disciplines,
  },
  {
    path: "/battle/:id",
    Component: Battle,
  },
  {
    path: "/profile",
    Component: MindProfile,
  },
  {
    path: "/philosophy-battle/:id",
    Component: PhilosophyBattle,
  },
  {
    path: "/roundtable",
    Component: RoundtableDebate,
  },
]);
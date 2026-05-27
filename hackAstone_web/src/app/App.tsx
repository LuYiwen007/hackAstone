import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { ArenaCatalogProvider } from "./context/ArenaCatalogContext";
import { ArenaLocaleProvider } from "./context/ArenaLocaleContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { router } from "./routes";

export default function App() {
  return (
    <ArenaLocaleProvider>
      <UserSettingsProvider>
        <ArenaCatalogProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-center" />
        </ArenaCatalogProvider>
      </UserSettingsProvider>
    </ArenaLocaleProvider>
  );
}

import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { ArenaCatalogProvider } from "./context/ArenaCatalogContext";
import { router } from "./routes";

export default function App() {
  return (
    <ArenaCatalogProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ArenaCatalogProvider>
  );
}

import { RouterProvider } from "react-router";
import { ArenaCatalogProvider } from "./context/ArenaCatalogContext";
import { router } from "./routes";

export default function App() {
  return (
    <ArenaCatalogProvider>
      <RouterProvider router={router} />
    </ArenaCatalogProvider>
  );
}

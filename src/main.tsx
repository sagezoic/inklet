import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.tsx";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing VITE_CONVEX_URL. Set it in .env.local (for example from `npx convex dev`).",
  );
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "font-serif !bg-surface !text-ink !border-hairline !shadow-soft",
            description: "!text-muted",
          },
        }}
      />
    </ConvexAuthProvider>
  </StrictMode>,
);

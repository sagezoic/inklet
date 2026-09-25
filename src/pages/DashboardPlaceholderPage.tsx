import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "../components/ui/Button";

export function DashboardPlaceholderPage() {
  const { signOut } = useAuthActions();

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-5">
        <p className="font-display text-2xl tracking-tight text-ink">Inklet</p>
        <Button
          variant="secondary"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="font-serif text-lg text-muted">
          Your documents will appear here.
        </p>
      </main>
    </div>
  );
}

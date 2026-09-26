import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

type AuthFlow = "signIn" | "signUp";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Try again.";
}

type SignIn = (
  provider: "password",
  params: FormData,
) => Promise<{ signingIn: boolean }>;

async function signInWithSession(
  signIn: SignIn,
  formData: FormData,
  flow: AuthFlow,
): Promise<boolean> {
  let signupError: unknown;
  try {
    const result = await signIn("password", formData);
    if (result.signingIn || flow === "signIn") {
      return result.signingIn;
    }
  } catch (err) {
    if (flow !== "signUp" || /invalid password/i.test(errorMessage(err))) {
      throw err;
    }
    signupError = err;
  }

  formData.set("flow", "signIn");
  try {
    const retry = await signIn("password", formData);
    return retry.signingIn;
  } catch (retryErr) {
    throw signupError ?? retryErr;
  }
}

export function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const [flow, setFlow] = useState<AuthFlow>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [awaitingSession, setAwaitingSession] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      void navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!awaitingSession || isAuthenticated) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setAwaitingSession(false);
      setPending(false);
      setError("Could not finish signing in. Try again.");
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [awaitingSession, isAuthenticated]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    try {
      const signedIn = await signInWithSession(signIn, formData, flow);
      if (!signedIn) {
        setError(
          flow === "signUp"
            ? "Your account was created, but you were not signed in. Sign in to continue."
            : "Could not sign in. Check your email and password.",
        );
        setPending(false);
        return;
      }
      setAwaitingSession(true);
    } catch (err) {
      setError(errorMessage(err));
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl text-ink">Inklet</p>
          <p className="mt-2 font-serif text-muted">
            {flow === "signIn"
              ? "Welcome back. Sign in to continue writing."
              : "Create an account to begin your documents."}
          </p>
        </div>

        <div
          className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-hairline bg-paper p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={flow === "signIn"}
            className={[
              "rounded-md px-3 py-2 font-sans text-sm transition-colors",
              flow === "signIn"
                ? "bg-surface text-ink shadow-soft"
                : "text-muted hover:text-ink",
            ].join(" ")}
            onClick={() => {
              setFlow("signIn");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={flow === "signUp"}
            className={[
              "rounded-md px-3 py-2 font-sans text-sm transition-colors",
              flow === "signUp"
                ? "bg-surface text-ink shadow-soft"
                : "text-muted hover:text-ink",
            ].join(" ")}
            onClick={() => {
              setFlow("signUp");
              setError(null);
            }}
          >
            Sign up
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={(e) => void handleSubmit(e)}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={
              flow === "signUp" ? "new-password" : "current-password"
            }
            required
            minLength={flow === "signUp" ? 8 : undefined}
            disabled={pending}
            hint={flow === "signUp" ? "At least 8 characters." : undefined}
          />

          {error ? (
            <p className="font-sans text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" pending={pending} className="mt-2 w-full">
            {flow === "signIn" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center font-serif text-sm text-muted">
          <Link
            to="/"
            className="text-accent underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </p>
      </Card>
    </div>
  );
}

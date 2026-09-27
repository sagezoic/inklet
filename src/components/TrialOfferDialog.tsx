import { useAuthActions } from "@convex-dev/auth/react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useEffect, useId, useRef, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/Button";

const CHECKOUT_LINK =
  "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_5qyFqwISYLdsSCX4oQ6a1TcgfzDsH8MkSXieD1d3wpS/redirect";

function clearStuckCheckout(): void {
  document.querySelectorAll("iframe").forEach((iframe) => {
    if (iframe.src.includes("polar.sh")) {
      iframe.remove();
    }
  });
  document.querySelectorAll(".polar-loader-spinner").forEach((spinner) => {
    spinner.parentElement?.remove();
  });
  document.body.classList.remove("polar-no-scroll");
}

const benefits = [
  {
    title: "Knowledge",
    description: "Keep source notes close while you write.",
  },
  {
    title: "AI co-writer",
    description:
      "A partner that reads your knowledge base and helps you draft.",
  },
  {
    title: "Autosave",
    description: "Changes settle in the background.",
  },
] as const;

type TrialOfferDialogProps = {
  email: string | null;
  userId: Id<"users">;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Try again.";
}

export function TrialOfferDialog({ email, userId }: TrialOfferDialogProps) {
  const { signOut } = useAuthActions();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const checkoutRef = useRef<Awaited<
    ReturnType<typeof PolarEmbedCheckout.create>
  > | null>(null);
  const confirmingRef = useRef(false);
  const titleId = useId();
  const [opening, setOpening] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog !== null && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  useEffect(() => {
    return () => {
      checkoutRef.current?.close();
      checkoutRef.current = null;
    };
  }, []);

  async function handleStartTrial() {
    setError(null);

    if (email === null) {
      setError("An email is required to start your trial.");
      return;
    }

    setOpening(true);
    dialogRef.current?.close();

    try {
      const url = new URL(CHECKOUT_LINK);
      url.searchParams.set("customer_email", email);
      url.searchParams.set("reference_id", userId);

      const checkout = await PolarEmbedCheckout.create(url.toString(), {
        theme: "light",
      });
      checkoutRef.current = checkout;
      setOpening(false);

      checkout.addEventListener("success", (event) => {
        event.preventDefault();
        confirmingRef.current = true;
        setConfirming(true);
        checkout.close();
      });

      checkout.addEventListener("close", () => {
        checkoutRef.current = null;
        setOpening(false);
        if (dialogRef.current !== null && !dialogRef.current.open) {
          dialogRef.current.showModal();
        }
      });
    } catch (err) {
      clearStuckCheckout();
      checkoutRef.current = null;
      setError(errorMessage(err));
      setOpening(false);
      if (dialogRef.current !== null && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      className="m-auto w-full max-w-md rounded-2xl border border-hairline bg-surface p-0 shadow-soft backdrop:bg-ink/30"
      onCancel={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-5 p-6">
        <div>
          <h2 id={titleId} className="font-display text-2xl text-ink">
            Start your free trial of Inklet
          </h2>
          <p className="mt-2 font-serif text-base leading-relaxed text-muted">
            A quiet place to draft with your sources beside you.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {benefits.map((benefit) => (
            <li key={benefit.title}>
              <p className="font-display text-lg text-ink">{benefit.title}</p>
              <p className="mt-1 font-serif text-base leading-relaxed text-muted">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="font-serif text-base text-ink">
          Then <span className="font-semibold">$1/month</span> after the free
          trial.
        </p>

        {error ? (
          <p className="font-sans text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        {confirming ? (
          <p
            className="font-serif text-base text-muted"
            role="status"
            aria-live="polite"
          >
            Confirming your subscription…
          </p>
        ) : (
          <Button
            className="w-full"
            pending={opening}
            onClick={() => {
              void handleStartTrial();
            }}
          >
            Start free trial
          </Button>
        )}

        <button
          type="button"
          className="font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </button>
      </div>
    </dialog>
  );
}

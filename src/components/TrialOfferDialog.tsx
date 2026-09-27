import { useAuthActions } from "@convex-dev/auth/react";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { Logo } from "./Logo";
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
      className="m-auto w-full max-w-md rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_40px_rgba(15,17,21,0.12),0_2px_8px_rgba(15,17,21,0.06)] backdrop:bg-[#0F1115]/30 backdrop:backdrop-blur-sm focus:outline-none"
      onCancel={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex flex-col gap-6">
        <div>
          <Logo size="sm" className="mb-4" />
          <span className="flex w-fit items-center rounded-full bg-[#DCFCE7] px-2.5 py-0.5 font-sans text-[11px] font-semibold text-[#15803D]">
            Free Trial Available
          </span>
          <h2 id={titleId} className="mt-2 font-display text-3xl text-[#1A1C1F]">
            Start your free trial of Inklet
          </h2>
          <p className="mt-1 font-serif text-sm leading-relaxed text-[#5C6068]">
            A quiet place to draft with your sources beside you.
          </p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {benefits.map((benefit) => (
            <li
              key={benefit.title}
              className="flex items-start gap-3 rounded-[14px] border border-[#EEF0F3] bg-[#F8F9FA] p-3"
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-sm">
                <Check className="size-2.5 stroke-[3]" />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-[#1A1C1F]">
                  {benefit.title}
                </p>
                <p className="mt-0.5 font-serif text-xs leading-relaxed text-[#5C6068]">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-[14px] border border-[#E5E7EB] bg-white p-3 text-center">
          <p className="font-serif text-sm text-[#5C6068]">
            Then <span className="font-semibold text-[#1A1C1F]">$1/month</span> after the free trial. Cancel anytime.
          </p>
        </div>

        {error ? (
          <p className="font-sans text-xs font-medium text-[#B91C1C]" role="alert">
            {error}
          </p>
        ) : null}

        {confirming ? (
          <p
            className="text-center font-serif text-sm text-[#5C6068]"
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

        <div className="text-center">
          <button
            type="button"
            className="font-sans text-xs text-[#8B909A] transition hover:text-[#1A1C1F] hover:underline"
            onClick={() => {
              void signOut();
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </dialog>
  );
}

import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useQuery } from "convex/react";
import { CreditCard, LogOut, Sparkles, User } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

function accountLabel(
  user: { name: string | null; email: string | null } | undefined,
): string {
  if (user === undefined) {
    return "Account";
  }
  if (user.name !== null && user.name.trim().length > 0) {
    return user.name;
  }
  if (user.email !== null) {
    return user.email;
  }
  return "Account";
}

export function AccountMenu() {
  const { signOut } = useAuthActions();
  const current = useQuery(api.users.current);
  const createSession = useAction(api.polarPortal.createSession);
  const [open, setOpen] = useState(false);
  const [portalPending, setPortalPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = accountLabel(current);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const root = rootRef.current;
      if (root !== null && !root.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  async function handleManageSubscription() {
    if (portalPending) {
      return;
    }

    close();
    const tab = window.open("about:blank", "_blank");
    setPortalPending(true);

    try {
      const url = await createSession({
        returnUrl: window.location.origin,
      });

      if (tab === null) {
        window.location.assign(url);
        return;
      }

      tab.opener = null;
      tab.location.href = url;
    } catch (err) {
      if (tab !== null) {
        tab.close();
      }
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not open the subscription portal.",
      );
    } finally {
      setPortalPending(false);
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={
          label === "Account" ? "Account menu" : `Account menu for ${label}`
        }
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className="tactile-press inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#1A1C1F] shadow-sm transition hover:bg-[#F8F9FA] active:scale-[0.98]"
      >
        <User className="size-4 text-[#5C6068]" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 min-w-[13rem] rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_12px_40px_rgba(15,17,21,0.12),0_2px_8px_rgba(15,17,21,0.06)]"
        >
          <div className="border-b border-[#EEF0F3] px-3 py-2">
            <div className="truncate font-sans text-xs font-semibold text-[#1A1C1F]">
              {label}
            </div>
            {current?.email && (
              <div className="truncate font-sans text-[11px] text-[#8B909A]">
                {current.email}
              </div>
            )}
          </div>

          <div className="pt-1">
            <Link
              to="/profile"
              role="menuitem"
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-sans text-xs font-medium text-[#1A1C1F] transition hover:bg-[#F1F2F4]"
              onClick={close}
            >
              <User className="size-3.5 text-[#5C6068]" />
              Profile
            </Link>
            <Link
              to="/design-system"
              role="menuitem"
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-sans text-xs font-medium text-[#1A1C1F] transition hover:bg-[#F1F2F4]"
              onClick={close}
            >
              <Sparkles className="size-3.5 text-[#3B82F6]" />
              Style Guide
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={portalPending}
              aria-busy={portalPending || undefined}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-sans text-xs font-medium text-[#1A1C1F] transition hover:bg-[#F1F2F4] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void handleManageSubscription();
              }}
            >
              <CreditCard className="size-3.5 text-[#5C6068]" />
              Manage subscription
            </button>
            <div className="my-1 h-[1px] bg-[#EEF0F3]" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-sans text-xs font-medium text-[#EF4444] transition hover:bg-red-50"
              onClick={() => {
                close();
                void signOut();
              }}
            >
              <LogOut className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

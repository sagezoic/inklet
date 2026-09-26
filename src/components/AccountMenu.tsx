import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { User } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

function accountLabel(
  user: { name: string | null; email: string | null } | undefined,
): string {
  if (user === undefined) {
    return "Account";
  }
  if (user.name !== null) {
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
  const [open, setOpen] = useState(false);
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
        className="inline-flex size-9 items-center justify-center rounded-full border border-hairline bg-surface text-ink transition-colors hover:bg-hairline/60"
      >
        <User className="size-4" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-1 min-w-[10rem] rounded-lg border border-hairline bg-surface py-1 shadow-soft"
        >
          <Link
            to="/profile"
            role="menuitem"
            className="block px-3 py-2 font-sans text-sm text-ink transition-colors hover:bg-hairline/60"
            onClick={close}
          >
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left font-sans text-sm text-ink transition-colors hover:bg-hairline/60"
            onClick={() => {
              close();
              void signOut();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

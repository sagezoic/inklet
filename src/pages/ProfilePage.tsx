import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { AccountMenu } from "../components/AccountMenu";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export function ProfilePage() {
  const current = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (current !== undefined && !prefilledRef.current) {
      setName(current.name ?? "");
      prefilledRef.current = true;
    }
  }, [current]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-5">
        <div className="flex items-center gap-4">
          <p className="font-display text-2xl tracking-tight text-ink">Inklet</p>
          <Link
            to="/dashboard"
            className="font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
        <AccountMenu />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        {current === undefined ? (
          <div className="min-h-48 bg-paper" aria-busy="true" />
        ) : (
          <Card className="p-8">
            <h1 className="font-display text-2xl text-ink">Profile</h1>
            <p className="mt-2 font-serif text-muted">
              Update how your name appears in Inklet.
            </p>

            <form
              className="mt-8 flex flex-col gap-4"
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
            >
              <Input
                label="Name"
                name="name"
                autoComplete="name"
                value={name}
                disabled={pending}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={current.email ?? ""}
                disabled
                readOnly
              />

              <Button type="submit" pending={pending} className="mt-2">
                Save
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

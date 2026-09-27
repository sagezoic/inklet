import { MessageSquareText, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/Logo";
import { Card } from "../components/ui/Card";

const aiActions = [
  "Tighten this paragraph without losing the argument",
  "Add a section on pricing using my notes",
  "Rewrite the intro in our brand voice",
  "Summarise my sources into a short outline",
] as const;

function ProductPreview() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-2xl overflow-hidden rounded-[24px] border border-hairline bg-surface shadow-lg lg:max-w-none"
    >
      <div className="flex items-center gap-1.5 border-b border-hairline bg-surface-subtle px-4 py-3">
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="size-2.5 rounded-full bg-border-strong" />
        <span className="ml-3 font-sans text-xs text-tertiary">
          Launch essay — saved
        </span>
      </div>
      <div className="grid min-h-[380px] grid-cols-1 md:min-h-[460px] md:grid-cols-[140px_1fr_170px]">
        <div className="hidden flex-col gap-2 border-r border-hairline bg-paper p-4 md:flex">
          <p className="font-display text-sm text-ink">Knowledge</p>
          {["Brand voice", "Customer quotes", "Pricing notes", "Launch dates"].map((note) => (
            <div
              key={note}
              className="rounded-lg border border-hairline bg-surface px-3 py-2"
            >
              <p className="font-sans text-xs font-semibold text-ink">{note}</p>
              <div className="mt-1.5 h-1.5 w-full rounded bg-divider" />
              <div className="mt-1 h-1.5 w-2/3 rounded bg-divider" />
            </div>
          ))}
        </div>
        <div className="p-6">
          <p className="font-display text-xl text-ink">Why we built Inklet</p>
          <p className="mt-4 font-serif text-sm leading-relaxed text-muted">
            Most writing tools forget everything you researched the moment you
            open a blank page.{" "}
            <span className="rounded bg-[#3b82f6]/15 text-ink">
              We wanted the notes to stay in the room.
            </span>
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded bg-divider" />
            <div className="h-2 w-11/12 rounded bg-divider" />
            <div className="h-2 w-4/5 rounded bg-divider" />
          </div>
          <p className="mt-6 font-display text-base text-ink">What stays beside you</p>
          <p className="mt-2 font-serif text-sm leading-relaxed text-muted">
            Every quote, fact, and half-formed idea sits one glance away, so the
            draft grows from what you already know.
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full rounded bg-divider" />
            <div className="h-2 w-5/6 rounded bg-divider" />
            <div className="h-2 w-11/12 rounded bg-divider" />
            <div className="h-2 w-2/3 rounded bg-divider" />
          </div>
        </div>
        <div className="hidden flex-col gap-3 border-l border-hairline bg-surface-subtle p-4 md:flex">
          <p className="font-display text-sm text-ink">Co-writer</p>
          <div className="self-end rounded-2xl rounded-br-sm bg-accent px-3 py-2 font-sans text-xs text-ink-inverse">
            Make the highlighted line warmer
          </div>
          <div className="rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3 py-2 font-sans text-xs text-muted">
            <span className="flex items-center gap-1 font-semibold text-ink">
              <Sparkles className="size-3" /> Replaced selection
            </span>
            <span className="mt-1 block">
              Used “Brand voice” to soften the tone.
            </span>
          </div>
          <div className="mt-auto rounded-full border border-hairline bg-surface px-3 py-2 font-sans text-xs text-tertiary">
            Ask the co-writer…
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const goToSignIn = () => void navigate("/login");

  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-10 border-b border-hairline/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Sign in
            </Link>
            <Button size="sm" onClick={goToSignIn}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1fr_1.35fr] lg:items-center lg:pt-24">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Write with Knowledge
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted lg:mx-0">
              Inklet is a quiet place to draft with your own knowledge at hand
              and an AI partner that listens to what you have already gathered.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button size="lg" onClick={goToSignIn}>
                Start free trial
              </Button>
            </div>
            <p className="mt-4 font-sans text-xs text-tertiary">
              Free trial, then $1/month. Cancel anytime.
            </p>
          </div>
          <ProductPreview />
        </section>

        <section className="mx-auto w-full max-w-6xl border-t border-hairline px-6 py-20">
          <Card className="grid gap-10 p-8 md:grid-cols-2 md:items-center md:p-12">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-widest text-tertiary">
                AI co-writer
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight text-ink">
                Ask in plain words. See the change on the page.
              </h2>
              <p className="mt-4 font-serif text-base leading-relaxed text-muted">
                The co-writer reads your document and its knowledge before it
                answers, then applies edits exactly where they belong — with a
                short summary of what changed.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {aiActions.map((action) => (
                <li
                  key={action}
                  className="flex items-center gap-3 rounded-2xl border border-divider bg-surface-subtle px-4 py-3 font-sans text-sm text-ink"
                >
                  <MessageSquareText className="size-4 shrink-0 text-tertiary" />
                  “{action}”
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="floating-action-dock rounded-[28px] px-8 py-14 text-center">
            <h2 className="font-display text-3xl tracking-tight text-ink-inverse sm:text-4xl">
              Your next draft already has a head start.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-dock-icon">
              Bring your notes. Inklet brings the quiet page and the partner.
            </p>
            <Button variant="secondary" size="lg" className="mt-8" onClick={goToSignIn}>
              Get started free
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-muted sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={false} />
            <p>© {new Date().getFullYear()} Inklet. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/design-system"
              className="font-sans underline-offset-4 hover:text-ink hover:underline"
            >
              Style Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const features = [
  {
    title: "Knowledge",
    description:
      "Keep source notes close while you write, so context stays where your words live.",
  },
  {
    title: "AI co-writer",
    description:
      "Ask a partner that reads your knowledge base and helps you draft with intention.",
  },
  {
    title: "Autosave",
    description:
      "Every change settles quietly in the background so you can stay with the sentence.",
  },
] as const;

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-paper">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <p className="font-display text-2xl tracking-tight text-ink">Inklet</p>
        <Link
          to="/login"
          className="font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 pb-20 pt-10">
        <section className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
            Write with your sources beside you.
          </h1>
          <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-muted">
            Inklet is a quiet place to draft with your own knowledge at hand and
            an AI partner that listens to what you have already gathered.
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => void navigate("/login")}>
              Get started
            </Button>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <h2 className="font-display text-xl text-ink">{feature.title}</h2>
              <p className="mt-3 font-serif text-base leading-relaxed text-muted">
                {feature.description}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

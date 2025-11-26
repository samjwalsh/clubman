import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to Clubman
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          The easiest way to manage your club, members, and facilities.
          Streamline your operations and focus on what matters most.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

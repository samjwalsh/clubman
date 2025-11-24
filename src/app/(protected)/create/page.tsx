"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");

  const createClub = api.club.create.useMutation({
    onSuccess: () => {
      router.push("/clubs");
      router.refresh();
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createClub.mutate({ name, logoUrl: logoUrl || undefined, slug });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Club</CardTitle>
          <CardDescription>Enter the details for the new club.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Club Name</Label>
              <Input
                id="name"
                placeholder="My Club"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (shows in URL, lowercase, no spaces)
              </Label>
              <Input
                id="slug"
                placeholder="my-club"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }
                pattern="^[a-z0-9-]+$"
                title="Slug must be lowercase and contain no spaces."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={createClub.isPending}
            >
              {createClub.isPending ? "Creating..." : "Create Club"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

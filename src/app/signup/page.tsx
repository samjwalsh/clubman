"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GalleryVerticalEnd } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for intent or invite
  const intent = searchParams.get("intent");
  const hasInvite = searchParams.has("callbackURL");
  const isCreatingClub = intent === "create_club";

  // Determine effective callback URL
  // If creating a club, force redirect to /create
  // Otherwise use the provided callbackURL (from invite) or default to /
  const callbackURL = isCreatingClub
    ? "/create"
    : (searchParams.get("callbackURL") ?? "/");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL,
      fetchOptions: {
        onError: (ctx) => {
          setError(ctx.error.message);
          setLoading(false);
        },
        onSuccess: () => {
          router.push(callbackURL);
        },
      },
    });
    setLoading(false);
  };

  // RESTRICTION LOGIC:
  // Only allow signup if they have an invite (callbackURL) or are creating a club
  if (!hasInvite && !isCreatingClub) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Club Manager
          </a>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Invite Only</CardTitle>
              <CardDescription>
                Signups are currently restricted to users with an invitation.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground text-center text-sm">
                If you have an invite link, please use it to sign up. Otherwise,
                you can create a new club to get started.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/signup?intent=create_club")}
              >
                Create a New Club
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline">
                  Sign in
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Club Manager
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {isCreatingClub ? "Create Club Account" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {isCreatingClub
                  ? "Sign up to create and manage your club."
                  : "Enter your email below to create your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCreatingClub && (
                <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                  <p>
                    <strong>Note:</strong> Only sign up here if you are a club
                    owner creating a new club.
                  </p>
                  <p className="mt-2">
                    If you are a member trying to join an existing club, please
                    check your email for an invite link.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Field className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirm-password">
                          Confirm Password
                        </FieldLabel>
                        <Input
                          id="confirm-password"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Field>
                    </Field>
                    <FieldDescription>
                      Must be at least 8 characters long.
                    </FieldDescription>
                  </Field>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Field>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                    <FieldDescription className="text-center">
                      Already have an account?{" "}
                      <a
                        href={`/login?callbackURL=${encodeURIComponent(callbackURL)}`}
                      >
                        Sign in
                      </a>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

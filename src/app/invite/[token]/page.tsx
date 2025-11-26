"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const [isAccepting, setIsAccepting] = useState(false);

  // Fetch invitation details (public)
  const {
    data: invite,
    isLoading: isInviteLoading,
    error: inviteError,
  } = api.club.getInvitation.useQuery({ token });

  // Mutation to accept invite
  const acceptInvite = api.club.acceptInvite.useMutation({
    onSuccess: (data) => {
      toast.success("Invitation accepted!");
      router.push(`/clubs/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsAccepting(false);
    },
  });

  // Auto-accept if logged in and invite is valid
  useEffect(() => {
    if (session && invite && !isAccepting && !acceptInvite.isSuccess) {
      // Optional: Check if email matches
      if (session.user.email !== invite.email) {
        // We could block this, but for now we'll just let the user decide via UI
        return;
      }

      setIsAccepting(true);
      acceptInvite.mutate({ token });
    }
  }, [session, invite, isAccepting, acceptInvite, token]);

  const handleLogin = () => {
    router.push(`/login?callbackURL=/invite/${token}`);
  };

  const handleSignup = () => {
    router.push(`/signup?callbackURL=/invite/${token}`);
  };

  const handleManualAccept = () => {
    setIsAccepting(true);
    acceptInvite.mutate({ token });
  };

  if (isSessionLoading || isInviteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (inviteError || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If logged in but email doesn't match (and we didn't auto-accept above)
  if (session && session.user.email !== invite.email) {
    return (
      <div className="bg-muted/50 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              You are invited to join <strong>{invite.club.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
              <p>
                You are logged in as <strong>{session.user.email}</strong>, but
                this invite was sent to <strong>{invite.email}</strong>.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleManualAccept}
              disabled={isAccepting}
            >
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept as {session.user.name}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                authClient.signOut().then(() => window.location.reload())
              }
            >
              Logout and switch account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If logged in and auto-accepting (showing loading state)
  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Joining {invite.club.name}...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to {invite.club.name}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join by {invite.inviter.name}.<br />
            Please login or create an account to accept.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleLogin}>
              Login
            </Button>
            <Button onClick={handleSignup}>Sign Up</Button>
          </div>
          <p className="text-muted-foreground text-center text-xs">
            Use email: <strong>{invite.email}</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendInvitationEmailProps {
    email: string;
    token: string;
    clubName: string;
    inviterName: string;
}

export async function sendInvitationEmail({
    email,
    token,
    clubName,
    inviterName,
}: SendInvitationEmailProps) {
    const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    // For testing purposes, override email if DEBUG_EMAIL is set
    if (env.DEBUG_EMAIL) {
        email = env.DEBUG_EMAIL;
    }
    try {
        await resend.emails.send({
            from: "Club Manager <onboarding@resend.dev>", // Update this with your verified domain
            to: email,
            subject: `You've been invited to join ${clubName} on Club Manager`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${clubName}</strong> on Club Manager.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Accept Invitation</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send invitation email:", error);
        return { success: false, error };
    }
}

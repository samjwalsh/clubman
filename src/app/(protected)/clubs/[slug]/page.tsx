import { redirect } from "next/navigation";

interface ClubPageProps {
  params: {
    slug: string;
  };
}

export default function ClubPage({ params }: ClubPageProps) {
  redirect(`/clubs/${params.slug}/dashboard`);
}

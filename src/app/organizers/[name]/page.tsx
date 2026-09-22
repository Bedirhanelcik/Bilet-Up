import type { Metadata } from "next";
import { OrganizerProfileContent } from "@/features/organizers/components/OrganizerProfileContent";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const organizerName = decodeURIComponent(name);
  return { title: organizerName, description: `Events by ${organizerName} on BiletUP.` };
}

export default async function OrganizerProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <OrganizerProfileContent name={decodeURIComponent(name)} />;
}

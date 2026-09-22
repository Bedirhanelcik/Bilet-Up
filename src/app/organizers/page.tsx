import type { Metadata } from "next";
import { OrganizersDirectoryContent } from "@/features/organizers/components/OrganizersDirectoryContent";

export const metadata: Metadata = {
  title: "Organizers",
  description: "Browse the organizers hosting events on BiletUP.",
};

export default function OrganizersPage() {
  return <OrganizersDirectoryContent />;
}

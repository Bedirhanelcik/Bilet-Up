import { OrganizerEventManageContent } from "@/features/organizer/components/OrganizerEventManageContent";

export const metadata = {
  title: "Manage event",
};

export default async function OrganizerEventManagePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <OrganizerEventManageContent eventId={eventId} />;
}

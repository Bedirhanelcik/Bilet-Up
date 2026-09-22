import { TicketDetailContent } from "@/features/tickets/components/TicketDetailContent";

export const metadata = {
  title: "Ticket details",
};

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return <TicketDetailContent ticketId={ticketId} />;
}

import type { Metadata } from "next";
import { EventDetailContent } from "@/features/events/components/EventDetailContent";
import { fetchEventBySlug } from "@/lib/firebase/events";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug).catch(() => null);
  if (!event) return { title: "Event not found" };

  const description = `${event.venue}, ${event.city} — ${event.description}`.slice(0, 200);
  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.coverImageURL ? [{ url: event.coverImageURL }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetailContent slug={slug} />;
}

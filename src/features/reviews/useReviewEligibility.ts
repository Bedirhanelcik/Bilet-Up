import { useAppSelector } from "@/redux/hooks";
import { useGetMyTicketForEventQuery } from "@/features/tickets/ticketsApi";
import { useGetMyReviewForEventQuery } from "@/features/reviews/reviewsApi";
import { getEventTemporalState } from "@/lib/eventTiming";
import type { Review } from "@/types/review";

export type ReviewEligibilityStatus =
  | "loading"
  | "signed-out"
  | "no-ticket"
  | "event-not-completed"
  | "can-create"
  | "can-edit";

export interface ReviewEligibility {
  status: ReviewEligibilityStatus;
  myReview: Review | null;
}

/**
 * Determines whether the signed-in user may write or edit a review for this event.
 * Mirrors the server-side rule in firestore.rules: the event must have actually ended
 * (checked via real startAt/endAt, not the organizer-controlled status field) and the
 * user must hold a non-void ticket. This is a UX gate only — firestore.rules is the
 * actual enforcement boundary, since a ticket's document id isn't derivable from
 * (uid, eventId) for a rule to independently verify.
 */
export function useReviewEligibility(eventId: string, startAt: string, endAt: string): ReviewEligibility {
  const user = useAppSelector((s) => s.auth.user);
  const { data: myTicket, isLoading: isTicketLoading } = useGetMyTicketForEventQuery(
    { uid: user?.uid ?? "", eventId },
    { skip: !user }
  );
  const { data: myReview, isLoading: isReviewLoading } = useGetMyReviewForEventQuery(
    { uid: user?.uid ?? "", eventId },
    { skip: !user }
  );

  if (!user) return { status: "signed-out", myReview: null };
  if (isTicketLoading || isReviewLoading) return { status: "loading", myReview: null };
  if (myReview) return { status: "can-edit", myReview };
  if (getEventTemporalState(startAt, endAt) !== "completed") return { status: "event-not-completed", myReview: null };
  if (!myTicket || myTicket.status === "void") return { status: "no-ticket", myReview: null };
  return { status: "can-create", myReview: null };
}

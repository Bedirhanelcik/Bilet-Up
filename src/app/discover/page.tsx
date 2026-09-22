import { Suspense } from "react";
import { DiscoverContent } from "./DiscoverContent";

export const metadata = {
  title: "Discover events",
};

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverContent />
    </Suspense>
  );
}

"use client";

import { useMemo } from "react";
import { Hero } from "@/components/home/Hero";
import { CityMarquee } from "@/components/home/CityMarquee";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { EventSection } from "@/components/home/EventSection";
import { OrganizerSection } from "@/components/home/OrganizerSection";
import { PersonalizationTeaser } from "@/components/home/PersonalizationTeaser";
import { SocialProof } from "@/components/home/SocialProof";
import { CTASection } from "@/components/home/CTASection";
import { useGetDiscoverableEventsQuery } from "@/features/events/eventsApi";
import {
  selectCategoryEvents,
  selectFeaturedEvents,
  selectPastEvents,
  selectRecommendedEvents,
  selectTopCityRails,
  selectTrendingEvents,
} from "@/features/events/selectors";
import { useGetUserProfileQuery } from "@/features/profile/profileApi";
import { useAppSelector } from "@/redux/hooks";
import { formatCityLocative } from "@/lib/format";
import { categoryDisplayName } from "@/lib/mock/categories";
import { useLocale } from "@/lib/i18n/LocaleProvider";

// Rendered in this order below the Trending/Category block — "music" is branded as its own
// "Concerts" section (see sections.concertsTitle/-Desc) since it's the densest, highest-priority
// category in the catalog; every other rail composes its title/description generically from the
// category's own display name (see categoryRailTitle below).
const CATEGORY_RAIL_SLUGS = ["music", "festivals", "theater", "comedy", "sports", "nightlife", "education", "family"];

export default function Home() {
  const { t, locale } = useLocale();
  const user = useAppSelector((s) => s.auth.user);
  const selectedCity = useAppSelector((s) => s.city.selectedCity);
  const { data: events = [], isLoading } = useGetDiscoverableEventsQuery();
  const { data: profile } = useGetUserProfileQuery(user?.uid ?? "", { skip: !user });

  const featured = selectFeaturedEvents(events);
  const trending = selectTrendingEvents(events);
  const past = selectPastEvents(events);
  const recommended = selectRecommendedEvents(events, profile?.favoriteCategories ?? []);
  // The highest-volume real cities in the dataset, never a fixed list (see selectTopCityRails) —
  // each rail needs at least 5 events of its own to be worth a full homepage section. A city
  // picked in the navbar's CitySelector leads this list — moved to the front if it already made
  // the top 4, or built as its own rail (still requiring the same 5-event minimum) otherwise —
  // rather than living in a separate, disconnected section.
  const cityRails = useMemo(() => {
    const base = selectTopCityRails(events, 4, 8, 5);
    if (!selectedCity) return base;
    const already = base.find((r) => r.city === selectedCity);
    if (already) return [already, ...base.filter((r) => r.city !== selectedCity)];
    const own = selectTopCityRails(
      events.filter((e) => e.city === selectedCity),
      1,
      8,
      5
    )[0];
    return own ? [own, ...base.slice(0, 3)] : base;
  }, [events, selectedCity]);

  // Turkish uses grammatical vowel-harmony locative suffixes ("İstanbul'da öne çıkanlar"); every
  // other language composes a plain "{city} {suffix}" pattern instead (see formatCityLocative's
  // doc comment — it's Turkish-specific grammar, not a generic template).
  function cityRailTitle(city: string): string {
    const suffix = t("sections.cityHighlightsSuffix");
    return locale === "tr" ? `${formatCityLocative(city)} ${suffix}` : `${city} ${suffix}`;
  }

  function categoryRailTitle(slug: string): string {
    if (slug === "music") return t("sections.concertsTitle");
    return `${categoryDisplayName(slug, locale)} ${t("sections.cityHighlightsSuffix")}`;
  }

  return (
    <>
      <Hero events={events} />
      <CityMarquee events={events} />

      <EventSection
        title={t("sections.featured")}
        description={t("sections.featuredDesc")}
        events={featured}
        href="/discover"
        isLoading={isLoading}
      />

      {cityRails[0] && (
        <EventSection
          title={cityRailTitle(cityRails[0].city)}
          description={t("sections.cityHighlightsDesc")}
          events={cityRails[0].events}
          href={`/discover?location=${encodeURIComponent(cityRails[0].city)}`}
          layout="rail"
          tinted
        />
      )}

      <EventSection
        title={t("sections.trending")}
        description={t("sections.trendingDesc")}
        events={trending}
        href="/discover?sort=popularity"
        isLoading={isLoading}
        layout="rail"
      />

      <CategoryGrid events={events} />

      {cityRails[1] && (
        <EventSection
          title={cityRailTitle(cityRails[1].city)}
          description={t("sections.cityHighlightsDesc")}
          events={cityRails[1].events}
          href={`/discover?location=${encodeURIComponent(cityRails[1].city)}`}
          layout="rail"
          tinted
        />
      )}

      {CATEGORY_RAIL_SLUGS.map((slug, i) => (
        <EventSection
          key={slug}
          title={categoryRailTitle(slug)}
          description={slug === "music" ? t("sections.concertsDesc") : t("sections.cityHighlightsDesc")}
          events={selectCategoryEvents(events, slug, slug === "music" ? 12 : 8)}
          href={`/discover?category=${slug}`}
          layout="rail"
          tinted={i % 2 === 1}
        />
      ))}

      {cityRails.slice(2).map((rail) => (
        <EventSection
          key={rail.city}
          title={cityRailTitle(rail.city)}
          description={t("sections.cityHighlightsDesc")}
          events={rail.events}
          href={`/discover?location=${encodeURIComponent(rail.city)}`}
          layout="rail"
        />
      ))}

      <OrganizerSection events={events} isLoading={isLoading} />

      {recommended.length > 0 ? (
        <EventSection
          title={t("sections.recommendedTitle")}
          description={t("sections.recommendedDesc")}
          events={recommended}
          href="/discover"
        />
      ) : (
        <PersonalizationTeaser isSignedIn={Boolean(user)} />
      )}

      <EventSection
        title={t("sections.past")}
        description={t("sections.pastDesc")}
        events={past}
        href="/discover?timeframe=past"
        isLoading={isLoading}
        layout="rail"
        tinted
      />

      <SocialProof />
      <CTASection />
    </>
  );
}

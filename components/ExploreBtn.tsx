'use client'
import posthog from "posthog-js";

const ExploreBtn = () => {
  const handleClick = () => {
    posthog.capture("explore_events_clicked");
  };

  return (
    <a
      id="explore-btn"
      href="#events"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2d3748] bg-[#111827] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      Explore Events
      <img src="/icons/arrow-down.svg" alt="arrow-down" className="h-5 w-5" />
    </a>
  );
};

export default ExploreBtn
'use client'
import Image from "next/image";

const ExploreBtn = () => {
  return (
    <a
      id="explore-btn"
      href="#events"
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#2d3748] bg-[#111827] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      Explore Events
      <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
    </a>
  )
}

export default ExploreBtn
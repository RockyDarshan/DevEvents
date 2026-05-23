'use client'
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  const handleClick = () => {
    posthog.capture("event_card_clicked", {
      event_title: title,
      event_slug: slug,
      event_location: location,
      event_date: date,
    });
  };

  return (
    <Link href={`/events/${slug}`} id="event-card" onClick={handleClick}>
      <div className="poster-wrapper">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 410px"
          className="poster"
        />
      </div>
      <div className="flex flex-row gap-2">
        <img src="/icons/pin.svg" alt="location" className="h-3.5 w-3.5" />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <img src="/icons/calendar.svg" alt="date" className="h-3.5 w-3.5" />
          <p>{date}</p>
        </div>
        <div>
          <img src="/icons/clock.svg" alt="time" className="h-3.5 w-3.5" />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard
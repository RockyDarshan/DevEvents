import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent, Event } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { connectToDatabase } from "@/lib/mongodb";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

const getEvent = cache(async (slug: string): Promise<IEvent | null> => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug }).lean();
    if (!event) return null;

    return {
      ...(event as unknown as IEvent),
      _id: String(event._id),
      createdAt: event.createdAt ? String(event.createdAt) : "",
      updatedAt: event.updatedAt ? String(event.updatedAt) : "",
    };
  } catch {
    return null;
  }
});

const EventDetailsItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>{tag}</div>
    ))}
  </div>
);

const SimilarEvents = async ({ slug }: { slug: string }) => {
  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
  if (similarEvents.length === 0) return null;

  return (
    <div className="events">
      {similarEvents.map((similarEvent: IEvent) => (
        <EventCard
          key={similarEvent._id}
          title={similarEvent.title}
          image={similarEvent.image}
          slug={similarEvent.slug}
          location={similarEvent.location}
          date={similarEvent.date}
          time={similarEvent.time}
        />
      ))}
    </div>
  );
};

const EventContent = async ({ slug }: { slug: string }) => {
  const event = await getEvent(slug);
  if (!event) return notFound();

  const {
    title, image, overview, description, organizer,
    date, time, location, mode, agenda = [], audience, tags = [],
  } = event;

  if (!description) return notFound();

  const eventId = String(event._id);
  const bookings = 10;

  return (
    <section id="event">
      <div className="header">
        <h1>{title}</h1>
        <p className="mt-1">{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={400} className="banner" priority />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={date} />
            <EventDetailsItem icon="/icons/clock.svg" alt="clock" label={time} />
            <EventDetailsItem icon="/icons/pin.svg" alt="location" label={location} />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">Join {bookings} people who have already booked their spot!</p>
            ) : (
              <p className="text-sm">Be the first to book your spot for this exciting event!</p>
            )}
            <BookEvent eventId={eventId} slug={slug} />
          </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <Suspense fallback={<p className="text-sm">Loading similar events...</p>}>
          <SimilarEvents slug={slug} />
        </Suspense>
      </div>
    </section>
  );
};

const EventParamsResolver = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  return <EventContent slug={slug} />;
};

const EventDetailsPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  return (
    <Suspense fallback={<p>Loading event...</p>}>
      <EventParamsResolver params={params} />
    </Suspense>
  );
};

export default EventDetailsPage;
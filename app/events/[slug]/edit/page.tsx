import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/EventForm";
import { Event } from "@/database/event.model";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";

export default async function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  await connectToDatabase();
  const e = await Event.findOne({ slug }).lean();
  if (!e) notFound();
  if (!e.createdBy || String(e.createdBy) !== user.userId) redirect(`/events/${slug}`);

  return (
    <section className="min-h-screen pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <EventForm
          mode="edit"
          slug={slug}
          initial={{
            title: e.title, description: e.description, overview: e.overview,
            location: e.location, venue: e.venue, date: e.date, time: e.time.slice(0, 5),
            mode: e.mode, audience: e.audience, organizer: e.organizer,
            image: e.image, tags: e.tags.join(", "), agenda: e.agenda.join("\n"),
          }}
        />
      </div>
    </section>
  );
}
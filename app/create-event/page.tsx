import EventForm from "@/components/EventForm";

export default function CreateEventPage() {
  return (
    <section className="min-h-screen pt-20 pb-20">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        <h1 className="text-3xl font-bold">Create Event</h1>
        <EventForm mode="create" />
      </div>
    </section>
  );
}
import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { Event, type IEvent } from "./event.model";

export interface IBooking {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string): boolean =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Booking email must be a valid email address.",
      },
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

// Validate that the referenced event exists before persisting a booking.
bookingSchema.pre("save", async function () {
  if (!mongoose.Types.ObjectId.isValid(this.eventId)) {
    throw new Error("Booking eventId must be a valid Event ObjectId.");
  }

  const existingEvent = await Event.findById(this.eventId)
    .select("_id")
    .lean<IEvent>();

  if (!existingEvent) {
    throw new Error("Booking eventId does not reference an existing Event.");
  }
});

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

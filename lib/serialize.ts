import type { IEvent } from "@/database/event.model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serializeEvent = (e: any): IEvent => ({
  ...e,
  _id: String(e._id),
  createdBy: e.createdBy ? String(e.createdBy) : undefined,
  createdAt: e.createdAt ? String(e.createdAt) : "",
  updatedAt: e.updatedAt ? String(e.updatedAt) : "",
});

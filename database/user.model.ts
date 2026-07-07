import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed, never store plain text
  createdAt: string;
  updatedAt: string;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

userSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

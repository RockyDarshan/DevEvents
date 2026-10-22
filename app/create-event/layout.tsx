import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function CreateEventLayout({ children }: { children: React.ReactNode }) {
  if (!(await getCurrentUser())) redirect("/auth/login");
  return <>{children}</>;
}
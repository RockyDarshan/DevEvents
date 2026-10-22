"use client";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

export default function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    posthog.capture("user_logged_out");
    posthog.reset();
    router.push("/");
    router.refresh();
  };
  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
    >
      Logout
    </button>
  );
}
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export default async function NavbarServer() {
  const user = await getCurrentUser();
  return <Navbar user={user ? { name: user.name, email: user.email } : null} />;
}
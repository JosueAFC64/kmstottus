import { redirect } from "next/navigation";
import { getSession } from "@/lib/services/auth.service";

// Esta página depende de la sesión del usuario
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSession();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
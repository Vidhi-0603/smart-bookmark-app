import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // If session exists, redirect immediately
    redirect("/dashboard");
  }

  return <LoginClient />;
}

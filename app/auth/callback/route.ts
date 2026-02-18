import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }
      return NextResponse.redirect("http://localhost:3000/dashboard");

}
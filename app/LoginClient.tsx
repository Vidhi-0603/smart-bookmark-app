"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginClient() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    console.log(data, error);
  };
  return (
    <div className="flex h-screen items-center justify-center bg-gray-300">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Smart Bookmark App</h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl text-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >         
          Login with Google
        </button>
      </div>
    </div>
  );
}

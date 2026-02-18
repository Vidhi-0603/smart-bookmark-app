"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardClient({ user }: any) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const router = useRouter();

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error, "fetching bookmarks");
      return;
    }
    setBookmarks(data || []);
  };
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const setup = async () => {
      await fetchBookmarks();

      const channel = supabase
        .channel(`bookmarks-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (!isMounted) return;

            console.log("Realtime event:", payload);

            if (payload.eventType === "INSERT") {
              setBookmarks((prev) => {
                if (prev.some((b) => b.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            }

            if (payload.eventType === "DELETE") {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      return channel;
    };

    let channelRef: any;

    setup().then((ch) => {
      channelRef = ch;
    });

    return () => {
      isMounted = false;
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, [user?.id]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ user_id: user.id, title, url })
      .select()
      .single();

    if (error) {
      console.log(error);
      return;
    }
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === data.id)) return prev;
      return [data, ...prev];
    });
    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.log("Delete error:", error);
    }
  };

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
      return;
    }
    router.push("/");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{user.email}</span>
          </h1>
          <button
            onClick={signOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            Add Bookmark
          </h2>

          <form onSubmit={addBookmark} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              placeholder="Enter Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
            >
              Add Bookmark
            </button>
          </form>
        </div>

        {/* Bookmark List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Your Bookmarks
          </h2>

          {bookmarks.length === 0 ? (
            <p className="text-gray-500 text-sm">No bookmarks yet.</p>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="border rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {bookmark.title}
                    </p>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm hover:underline"
                    >
                      {bookmark.url}
                    </a>
                  </div>

                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error, "fetching bookmarks");
      return;
    }
    console.log(data);
    setBookmarks(data || []);
  };

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    const { error } = await supabase
      .from("bookmarks")
      .insert({ user_id: user.id, title: title, url: url });

    if (error) {
      console.log(error);
      return;
    }

    setTitle("");
    setUrl("");
    fetchBookmarks();
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
    <div className="p-6">
      <h1>Welcome {user.email}</h1>
      <button onClick={signOut}>Logout</button>

      <div>
        <p>Add bookmark</p>
        <form onSubmit={addBookmark}>
          <input
            type="text"
            name="url"
            id="url"
            placeholder="enter url here"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
          />
          <input
            type="text"
            name="title"
            id="title"
            placeholder="enter title here"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <button type="submit">Submit</button>
        </form>
      </div>

      <div>
        <p>Your Bookmarks</p>
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id}>
            <p>{bookmark.title}</p>
            <p>{bookmark.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

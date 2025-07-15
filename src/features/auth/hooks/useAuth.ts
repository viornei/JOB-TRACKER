"use client";
import { useEffect, useState } from "react";
import { redirectURI, supabase } from "../../../lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<null | import("@supabase/supabase-js").User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user || !data.user.email) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const signIn = async (provider: "google" | "linkedin_oidc") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectURI },
    });

    if (error) {
      alert(`Не удалось войти через ${provider}.`);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.reload();
    } catch {
      alert(`Не удалось войти через `);
    }
  };

  return { user, loading, signIn, signOut };
}

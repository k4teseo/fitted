import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Auth from "../components/auth";
import Account from "../components/account";
import { View } from "react-native";
import { Session } from "@supabase/supabase-js";

// Don't use this file, for authentication go to passwordPage.tsx.

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Auth />
      )}
    </View>
  );
}

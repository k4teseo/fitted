import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: user } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user.user?.id);
            }
        };

        fetchCurrentUser();
    }, []);
    return currentUser;
}
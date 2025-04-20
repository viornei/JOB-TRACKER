import {supabase} from "@/lib/supabase"

export const getAuthUser = async () => {
    const {data: {session}, error} = await supabase.auth.getSession()
    if (error || !session?.user) throw new Error("Unauthorized")
    return session.user
}

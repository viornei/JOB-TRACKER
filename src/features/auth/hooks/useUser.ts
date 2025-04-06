'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export const useUser = () => {
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                router.push("/login")
            } else {
                setUserEmail(session.user.email ?? null)
            }

            setLoading(false)
        }

        checkSession()
    }, [router])

    return { userEmail, loading }
}

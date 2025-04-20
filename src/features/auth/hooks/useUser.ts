'use client'

import {useEffect, useState} from "react"
import {supabase} from "@/lib/supabase"

export const useUser = () => {
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: {session},
            } = await supabase.auth.getSession()

            setUserEmail(session?.user?.email ?? null)
            setLoading(false)
        }

        checkSession()
    }, [])

    return {userEmail, loading}
}


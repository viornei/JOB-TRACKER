'use client'

import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase"
import {ReactNode, useEffect} from "react"
import {useUser} from "@/features/auth/hooks/useUser";

export default function DashboardLayout({children}: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const {userEmail, loading} = useUser()

    const showBack = pathname !== "/dashboard"

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    useEffect(() => {
        if (!loading && !userEmail) {
            router.replace("/")
        }
    }, [loading, userEmail, router])

    if (loading || !userEmail) {
        return <p className="text-center mt-10">Загрузка...</p>
    }
    return (
        <div className="min-h-screen max-w-3xl mx-auto px-4 py-6">
            <header className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                        ✨JobTracker
                    </Link>
                    {showBack && (
                        <Link
                            href="/dashboard"
                            className="text-sm text-blue-600 underline"
                        >
                            ← Назад к дашборду
                        </Link>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-600 transition"
                >
                    Выйти
                </button>
            </header>

            {children}
        </div>
    )
}

'use client'

import {useUser} from "@/features/auth/hooks/useUser"
import {useRouter} from "next/navigation"
import {useEffect} from "react"
import Link from "next/link"

export default function HomePage() {
    const {userEmail, loading} = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!loading && userEmail) {
            router.push("/dashboard")
        }
    }, [loading, userEmail, router])

    if (loading) {
        return <p className="text-center mt-10">Загрузка...</p>
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Добро пожаловать в JobTracker ✨</h1>

            <div className="flex gap-4">
                <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Войти
                </Link>
                <Link
                    href="/register"
                    className="bg-gray-100 text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition"
                >
                    Зарегистрироваться
                </Link>
            </div>
        </div>
    )
}

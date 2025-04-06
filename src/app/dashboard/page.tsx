'use client'

import { useUser } from "@/features/auth/hooks/useUser"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import Link from "next/link"
import {SkeletonJobCard} from "@/components/SkeletonJobCard";
import {StatusBadge} from "@/components/StatusBadge";
import {EditableStatus} from "@/components/EditableStatus";

interface Job {
    id: string
    title: string
    company: string
    status: string
    created_at: string
}

export default function DashboardPage() {
    const { userEmail, loading } = useUser()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [view, setView] = useState<"all" | "unprocessed">("all")

    const filteredJobs = jobs
        .filter((job) => {
            if (view === "unprocessed") {
                return !job.status || job.status === "unknown"
            }
            return true
        })
        .filter((job) =>
            selectedStatus ? job.status === selectedStatus : true
        )


    useEffect(() => {
        const fetchJobs = async () => {
            const { data: sessionData } = await supabase.auth.getSession()
            const userId = sessionData.session?.user.id
            if (!userId) return

            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: sortOrder === "asc" })

            if (!error && data) {
                setJobs(data)
            }
            setIsLoading(false)
        }
        fetchJobs()

    }, [sortOrder])

    if (loading || isLoading) {
        return (
            <div className="max-w-3xl mx-auto mt-10 space-y-4 px-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonJobCard key={i} />
                ))}
            </div>
        )
    }


    return (
        <div className="max-w-3xl mx-auto mt-10 px-4">
            <h1 className="text-xl text-gray-600 mb-2">Привет, {userEmail} 👋</h1>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Твои вакансии</h2>
                <Link
                    href="/dashboard/new"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    + Добавить вакансию
                </Link>
            </div>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setView("all")}
                    className={view === "all" ? "font-bold text-blue-600" : "text-gray-500"}
                >
                    Все вакансии
                </button>
                <button
                    onClick={() => setView("unprocessed")}
                    className={view === "unprocessed" ? "font-bold text-blue-600" : "text-gray-500"}
                >
                    Неразобранные
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {["all", "applied", "interview", "offer", "rejected", "unknown"].map((status) => {
                    const isSelected = selectedStatus === status || (status === "all" && !selectedStatus)

                    const baseClasses = "px-3 py-1 rounded border text-sm"
                    const selectedClasses = status === "unknown"
                        ? "bg-yellow-100 text-gray-700 border-yellow-300"
                        : "bg-blue-600 text-white"
                    const unselectedClasses = status === "unknown"
                        ? "bg-white text-gray-700 border-yellow-300"
                        : "bg-white text-gray-800"

                    return (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status === "all" ? null : status)}
                            className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
                        >
                            {status === "all"
                                ? "Все"
                                : {
                                    applied: "Отклики",
                                    interview: "Интервью",
                                    offer: "Офферы",
                                    rejected: "Отказы",
                                    unknown: "Не обработано 🕓",
                                }[status]}
                        </button>
                    )
                })}

            </div>
            <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="text-sm text-blue-600 underline"
            >
                Сортировка: {sortOrder === "asc" ? "↑ Старые сначала" : "↓ Новые сначала"}
            </button>

            {jobs.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-600">
                    <p className="text-lg mb-2">У тебя пока нет добавленных вакансий 😌</p>
                    <p className="mb-4">Начни с первой — это займёт всего минуту!</p>
                    <Link
                        href="/dashboard/new"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        + Добавить вакансию
                    </Link>
                </div>
            ) : filteredJobs.length === 0 ? (
                <p className="text-gray-600">Нет вакансий по выбранному фильтру.</p>
            ) : (
                <ul className="space-y-4">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="border p-4 rounded shadow">
                            <div className="flex justify-between">
                                <div>
                                    <Link href={`/dashboard/${job.id}`}>
                                        <h2 className="text-lg font-semibold">{job.title}</h2>
                                    </Link>

                                    <p className="text-sm text-gray-500">{job.company}</p>
                                </div>
                                <EditableStatus jobId={job.id} initialStatus={job.status} />

                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(job.created_at).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

'use client'

import {useUser} from "@/features/auth/hooks/useUser"
import {supabase} from "@/lib/supabase"
import {useEffect, useState} from "react"
import Link from "next/link"
import {SkeletonJobCard} from "@/components/SkeletonJobCard";
import {EditableStatus} from "@/components/EditableStatus";
import {confirmToast} from "@/lib/confirmToast"
import toast from "react-hot-toast"

interface Job {
    id: string
    title: string
    company: string
    status: string
    created_at: string,
    location: string,
    salary: string,
    link: string,
    tags: string[],
}

export default function DashboardPage() {
    const {userEmail, loading} = useUser()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    const filteredJobs = jobs.filter((job) =>
        selectedStatus ? job.status === selectedStatus : true
    )


    useEffect(() => {
        const fetchJobs = async () => {
            const {data: sessionData} = await supabase.auth.getSession()
            const userId = sessionData.session?.user.id
            if (!userId) return

            const {data, error} = await supabase
                .from("jobs")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", {ascending: sortOrder === "asc"})

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
                    <SkeletonJobCard key={i}/>
                ))}
            </div>
        )
    }


    const handleDelete = (jobId: string) => {
        confirmToast("Удалить вакансию?", async () => {
            const {error} = await supabase.from("jobs").delete().eq("id", jobId)

            if (error) {
                toast.error("Ошибка при удалении: " + error.message)
            } else {
                toast.success("Вакансия удалена")
                setTimeout(() => {
                    setJobs((prev) => prev.filter((job) => job.id !== jobId))
                }, 300)
            }
        })
    }


    return (
        <div className="max-w-3xl mx-auto mt-10 px-4">
            <h1 className="text-xl text-gray-600 mb-2">Привет, {userEmail} 👋</h1>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 mt-4">
                <h2 className="text-2xl font-bold">Твои вакансии</h2>
                <Link
                    href="/dashboard/import/url"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center"
                >
                    + Добавить вакансию
                </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
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
                className="text-sm text-gray-600 underline mb-4"
            >
                Сортировка: {sortOrder === "asc" ? "↑ Старые сначала" : "↓ Новые сначала"}
            </button>

            {jobs.length === 0 ? (
                <div
                    className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-600">
                    <p className="text-lg mb-2">У тебя пока нет добавленных вакансий 😌</p>
                    <p className="mb-4">Начни с первой — это займёт всего минуту!</p>
                    <Link
                        href="/dashboard/import/url"
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
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div>
                                    <Link href={`/dashboard/${job.id}`}>
                                        <h2 className="text-lg font-semibold">{job.title}</h2>
                                    </Link>
                                    <p className="text-sm text-gray-500">{job.company}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button onClick={() => handleDelete(job.id)}>🗑</button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-2">
                                <div>
                                    {job.location && (
                                        <p className="text-sm text-gray-600 mt-1">📍 {job.location}</p>
                                    )}
                                    {job.salary && (
                                        <p className="text-sm text-gray-600">💸 {job.salary}</p>
                                    )}
                                    {job.link && (
                                        <a
                                            href={job.link}
                                            target="_blank"
                                            className="text-sm text-blue-600 underline"
                                        >
                                            🔗 Перейти к вакансии
                                        </a>
                                    )}
                                    {job.tags && job.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {job.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 text-xs bg-gray-100 border rounded"
                                                >{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <EditableStatus jobId={job.id} initialStatus={job.status}/>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

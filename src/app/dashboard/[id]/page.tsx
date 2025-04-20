'use client'

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase"
import Link from "next/link"
import toast from "react-hot-toast"
import {confirmToast} from "@/lib/confirmToast";

interface Job {
    id: string
    title: string
    company: string
    status: string
    notes: string | null
    created_at: string,
    location: string,
    description: string,
    link: string,
    salary: string,
    tags: string[]

}

export default function JobDetailPage() {
    const {id} = useParams<{ id: string }>()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            const {data, error} = await supabase
                .from("jobs")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                toast.error(`Ошибка загрузки вакансии: ${error.message}`);
                setTimeout(() => {
                    router.push(`/dashboard`)
                }, 300)
            } else {
                setJob(data)
            }

            setLoading(false)
        }

        fetchJob()
    }, [id, router])

    if (loading) return <p className="text-center mt-10">Загрузка...</p>

    if (!job) return null

    return (
        <div className="max-w-2xl mx-auto mt-10 px-4 space-y-4">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-600 text-lg">{job.company}</p>
            <p className="text-sm text-gray-400">
                Статус: <span className="capitalize">{job.status}</span>
            </p>

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
            {job.description && (
                <p className="text-sm text-gray-600 mt-4">📌 {job.description}</p>
            )}
            {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {job.tags.map((tag, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 text-xs bg-gray-100 border rounded"
                        >
              {tag}
            </span>
                    ))}
                </div>
            )}
            {job.notes && (
                <div>
                    <p className="font-semibold mt-4">Заметки:</p>
                    <p className="whitespace-pre-line text-gray-700">{job.notes}</p>
                </div>
            )}
            <p className="text-xs text-gray-400">
                Добавлено: {new Date(job.created_at).toLocaleDateString()}
            </p>

            <div className="flex gap-4 mt-6">
                <Link
                    href={`/dashboard/edit/${job.id}`}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    ✏️ Редактировать
                </Link>
                <button
                    onClick={() => {
                        confirmToast("Удалить вакансию?", async () => {
                            const {error} = await supabase.from("jobs").delete().eq("id", job.id)

                            if (error) {
                                toast.error("Ошибка при удалении")
                            } else {
                                toast.success("Вакансия удалена ✅", {duration: 3000})
                                setTimeout(() => {
                                    router.push("/dashboard")
                                }, 500)
                            }
                        })
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    🗑 Удалить
                </button>

            </div>
        </div>
    )
}

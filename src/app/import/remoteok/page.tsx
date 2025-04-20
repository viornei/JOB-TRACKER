'use client'

import {useEffect, useState} from "react"
import {supabase} from "@/lib/supabase"
import toast from "react-hot-toast"

interface RemoteJob {
    id: number
    title: string
    company: string
    link: string
    tags?: string[],
    description: string,
}

export default function ImportPage() {
    const [jobs, setJobs] = useState<RemoteJob[]>([])
    const [loading, setLoading] = useState(true)
    const [importedIds, setImportedIds] = useState<number[]>([])
    const [query, setQuery] = useState("")

    const filteredJobs = jobs.filter(
        (job) =>
            job.title.toLowerCase().includes(query.toLowerCase()) ||
            job.company.toLowerCase().includes(query.toLowerCase()) ||
            job.tags?.some((tag) =>
                tag.toLowerCase().includes(query.toLowerCase())
            )
    )

    useEffect(() => {
        const fetchJobs = async () => {
            const res = await fetch("/api/import/remoteok")
            const data = await res.json()
            setJobs(data)
            setLoading(false)
        }

        fetchJobs()
    }, [])

    const handleImport = async (job: RemoteJob) => {
        const {data: session} = await supabase.auth.getSession()
        const userId = session.session?.user.id

        if (!userId) return toast("Ты не авторизован")

        const {error} = await supabase.from("jobs").insert({
            title: job.title,
            company: job.company,
            link: job.link,
            tags: job.tags || [],
            description: job.description || "",
            status: "unknown",
            user_id: userId,
        })

        if (error) {
            toast.error("Ошибка при импорте: " + error.message)
        } else {
            setImportedIds((prev) => [...prev, job.id])
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <h1 className="text-2xl font-bold mb-6">Импорт вакансий с RemoteOK</h1>
            <input
                type="text"
                placeholder="Поиск по ключевым словам"
                className="w-full mb-4 p-2 border rounded"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {loading ? (
                <p>Загрузка...</p>
            ) : (<>
                <p className="text-sm text-gray-500 mb-2">
                    Показано {filteredJobs.length} из {jobs.length} вакансий
                </p>
                <ul className="space-y-4">
                    {filteredJobs.map((job) => (
                        <li key={job.id} className="border p-4 rounded shadow space-y-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">{job.title}</h2>
                                    <p className="text-sm text-gray-500">{job.company}</p>
                                    <a
                                        href={job.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-sm"
                                    >
                                        Открыть оригинал
                                    </a>
                                    {job.tags && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {job.tags.map((tag, index) => (
                                                <span key={`${tag}-${index}`}
                                                      className="text-xs bg-gray-200 px-2 py-0.5 rounded">{tag}
                        </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleImport(job)}
                                    disabled={importedIds.includes(job.id)}
                                    className={`ml-4 px-3 py-1 rounded ${
                                        importedIds.includes(job.id)
                                            ? "bg-green-200 text-green-800 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {importedIds.includes(job.id) ? "Импортировано" : "Импортировать"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </>)}
        </div>
    )
}

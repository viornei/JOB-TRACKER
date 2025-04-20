"use client"

import {useState} from "react"
import {supabase} from "@/lib/supabase"
import {useRouter} from "next/navigation"
import toast from "react-hot-toast"

const DEFAULT_STATUS = [
    {value: "", label: "Не указано"},
    {value: "applied", label: "Отклик"},
    {value: "interview", label: "Интервью"},
    {value: "offer", label: "Оффер"},
    {value: "rejected", label: "Отказ"},
]

export default function ImportByUrlPage() {
    const router = useRouter()

    const [step, setStep] = useState<"input" | "form">("input")
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        title: "",
        company: "",
        description: "",
        status: "",
        location: "",
        salary: "",
        tags: [] as string[],
    })

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({...prev, [field]: value}))
    }

    const fetchFromUrl = async () => {
        const res = await fetch(`/api/parse-job?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        if (data.title) setForm((f) => ({...f, title: data.title}))
        if (data.company) setForm((f) => ({...f, company: data.company}))
        if (data.description) setForm((f) => ({...f, description: data.description}))
        if (data.location) setForm((f) => ({...f, location: data.location}))
        if (data.salary) setForm((f) => ({...f, salary: data.salary}))
        if (data.tags) setForm((f) => ({...f, tags: data.tags}))
        setStep("form")
    }

    const handleSubmit = async () => {
        setLoading(true)

        const session = await supabase.auth.getSession()
        const userId = session.data.session?.user.id

        if (!userId) {
            toast("Вы не авторизованы")
            setLoading(false)
            return
        }

        const {error} = await supabase.from("jobs").insert({
            ...form,
            link: url,
            user_id: userId,
            status: form.status || "unknown",
            location: form.location || null,
            salary: form.salary || null,
            tags: form.tags.length > 0 ? form.tags : null,
        })

        setLoading(false)

        if (error) {
            toast.error("Ошибка при сохранении: " + error.message)
        } else {
            toast.success("Вакансия сохранена!")
            setTimeout(() => {
                router.push("/dashboard")
            }, 600)

        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Импорт по ссылке</h1>

            {step === "input" && (
                <div className="space-y-4">
                    <input
                        autoFocus
                        type="url"
                        placeholder="Вставь ссылку на вакансию (например, LinkedIn)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    <div className="flex flex-col gap-2">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={fetchFromUrl}
                            disabled={!url}
                        >
                            Заполнить автоматически
                        </button>

                        <button
                            onClick={() => setStep("form")}
                            className="text-sm text-gray-500 underline"
                        >
                            Или заполнить вручную
                        </button>
                    </div>
                </div>

            )}

            {step === "form" && (
                <div className="space-y-4 mt-6">
                    <button
                        onClick={() => setStep("input")}
                        className="text-sm text-blue-600 underline"
                    >
                        ← Назад к вводу ссылки
                    </button>

                    <p className="text-sm text-gray-500">
                        Ссылка: <a href={url} className="underline text-blue-600" target="_blank">{url}</a>
                    </p>

                    <input
                        placeholder="Название вакансии"
                        value={form.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    <input
                        placeholder="Компания"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    <div>
                        <textarea
                            placeholder="Описание"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            className="w-full p-2 border rounded"
                        />
                        {form.description.trim() === "" && (
                            <p className="text-sm text-yellow-600 mt-1">Описание не было автоматически найдено. Вставьте
                                вручную 📝</p>
                        )}
                    </div>

                    <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        {DEFAULT_STATUS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <input
                        placeholder="Локация"
                        value={form.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    <input
                        placeholder="Зарплата"
                        value={form.salary}
                        onChange={(e) => handleChange("salary", e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map((tag, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-sm rounded border">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        {loading ? "Сохраняем..." : "Сохранить"}
                    </button>
                </div>
            )}
        </div>
    )
}

'use client'

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {supabase} from "@/lib/supabase"
import toast from "react-hot-toast"

const DEFAULT_STATUS = [
    {value: "", label: "Не указано"},
    {value: "applied", label: "Отклик"},
    {value: "interview", label: "Интервью"},
    {value: "offer", label: "Оффер"},
    {value: "rejected", label: "Отказ"},
]

export default function EditJobPage() {
    const {id} = useParams<{ id: string }>()
    const router = useRouter()

    const [form, setForm] = useState({
        title: "",
        company: "",
        description: "",
        status: "",
        location: "",
        salary: "",
        tags: [] as string[],
        notes: "",
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchJob = async () => {
            const {data, error} = await supabase.from("jobs").select("*").eq("id", id).single()
            if (!error && data) {
                setForm({
                    title: data.title || "",
                    company: data.company || "",
                    description: data.description || "",
                    status: data.status || "",
                    location: data.location || "",
                    salary: data.salary || "",
                    tags: data.tags || [],
                    notes: data.notes || "",
                })
            } else {
                router.push("/dashboard")
            }
            setLoading(false)
        }
        fetchJob()
    }, [id, router])

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({...prev, [field]: value}))
    }

    const handleSubmit = async () => {
        setSaving(true)

        const cleanedTag = {
            ...form,
            tags: form.tags.length > 0 ? form.tags : null
        }

        const {error} = await supabase.from("jobs").update(cleanedTag).eq("id", id)
        setSaving(false)

        if (error) {
            toast.error("Ошибка при обновлении: " + error.message)
        } else {
            toast.success("Изменения сохранены", {duration: 3000})
            setTimeout(() => {
                router.push(`/dashboard/${id}`)
            }, 500)
        }
    }


    if (loading) return <p className="text-center mt-10">Загрузка...</p>

    return (
        <div className="max-w-2xl mx-auto mt-10 px-4">
            <h1 className="text-2xl font-bold mb-4">Редактировать вакансию</h1>
            <div className="space-y-4">
                <input
                    autoFocus

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

                <textarea
                    placeholder="Описание"
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded"
                />

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

                <textarea
                    placeholder="Заметки"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded"
                />
                <input
                    placeholder="Теги (через запятую)"
                    value={form.tags.join(", ")}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            tags: e.target.value.split(",").map((tag) => tag.trim()).filter((tag) => tag !== ""),
                        }))
                    }
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {saving ? "Сохраняем..." : "Сохранить изменения"}
                </button>
            </div>
        </div>
    )
}

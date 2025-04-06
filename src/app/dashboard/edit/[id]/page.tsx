'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const schema = z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    status: z.enum(["applied", "interview", "offer", "rejected"]),
    notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function EditJobPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()

            if (error || !data) {
                console.error("Ошибка загрузки:", error)
                router.push("/dashboard")
                return
            }

            setValue("title", data.title)
            setValue("company", data.company)
            setValue("status", data.status)
            setValue("notes", data.notes || "")
            setLoading(false)
        }

        fetchJob()
    }, [id, router, setValue])

    const onSubmit = async (formData: FormData) => {
        const { error } = await supabase
            .from("jobs")
            .update(formData)
            .eq("id", id)

        if (error) {
            alert("Ошибка при обновлении: " + error.message)
        } else {
            router.push(`/dashboard/${id}`)
        }
    }

    if (loading) return <p className="text-center mt-10">Загрузка...</p>

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto mt-10 space-y-4">
            <h1 className="text-2xl font-bold text-center">Редактировать вакансию</h1>

            <input {...register("title")} placeholder="Название вакансии" className="w-full p-2 border rounded" />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}

            <input {...register("company")} placeholder="Компания" className="w-full p-2 border rounded" />
            {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}

            <select {...register("status")} className="w-full p-2 border rounded">
                <option value="applied">Отклик</option>
                <option value="interview">Интервью</option>
                <option value="offer">Оффер</option>
                <option value="rejected">Отказ</option>
            </select>

            <textarea {...register("notes")} placeholder="Заметки" className="w-full p-2 border rounded" />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                Сохранить изменения
            </button>
        </form>
    )
}

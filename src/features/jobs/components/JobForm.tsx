'use client'

import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {supabase} from "@/lib/supabase"
import {useRouter} from "next/navigation"
import toast from "react-hot-toast"

const jobSchema = z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    status: z.enum(["applied", "interview", "offer", "rejected"]),
    notes: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export const JobForm = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<JobFormData>({
        resolver: zodResolver(jobSchema),
    })

    const onSubmit = async (data: JobFormData) => {
        const {
            data: {user},
        } = await supabase.auth.getUser()

        if (!user) return

        const {error} = await supabase.from("jobs").insert([
            {
                ...data,
                user_id: user.id,
            },
        ])

        if (!error) {
            router.push("/dashboard")
        } else {
            toast.error("Ошибка: " + error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-8">
            <h2 className="text-xl font-bold text-center">Добавить вакансию</h2>

            <input {...register("title")} placeholder="Название вакансии" className="w-full p-2 border rounded"/>
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}

            <input {...register("company")} placeholder="Компания" className="w-full p-2 border rounded"/>
            {errors.company && <p className="text-sm text-red-500">{errors.company.message}</p>}

            <select {...register("status")} className="w-full p-2 border rounded">
                <option value="applied">Отклик</option>
                <option value="interview">Интервью</option>
                <option value="offer">Оффер</option>
                <option value="rejected">Отказ</option>
            </select>

            <textarea {...register("notes")} placeholder="Заметки" className="w-full p-2 border rounded"/>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
                Добавить
            </button>
        </form>
    )
}

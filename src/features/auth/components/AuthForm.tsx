'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type FormSchema = z.infer<typeof formSchema>

interface AuthFormProps {
    type: "login" | "register"
}

export const AuthForm = ({ type }: AuthFormProps) => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
    })

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const onSubmit = async (data: FormSchema) => {
        setErrorMessage(null)

        if (type === "register") {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            })
            if (error) {
                setErrorMessage(error.message)
                return
            }
            router.push("/dashboard")
        }

        if (type === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            if (error) {
                setErrorMessage(error.message)
                return
            }
            router.push("/dashboard")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm mx-auto mt-10">
            <h2 className="text-2xl font-bold text-center">
                {type === "login" ? "Вход" : "Регистрация"}
            </h2>
            <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <input
                {...register("password")}
                type="password"
                placeholder="Пароль"
                className="w-full p-2 border rounded"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

            {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            >
                {type === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
        </form>
    )
}

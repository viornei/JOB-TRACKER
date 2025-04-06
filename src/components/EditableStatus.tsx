'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { StatusBadge } from "./StatusBadge"

interface Props {
    jobId: string
    initialStatus: string | null
}

export const EditableStatus = ({ jobId, initialStatus }: Props) => {
    const [isEditing, setIsEditing] = useState(false)
    const [status, setStatus] = useState(initialStatus ?? "unknown")

    const handleChange = async (newStatus: string) => {
        setStatus(newStatus)
        setIsEditing(false)

        const { error } = await supabase
            .from("jobs")
            .update({ status: newStatus })
            .eq("id", jobId)

        if (error) {
            alert("Ошибка при обновлении: " + error.message)
        }
    }

    return isEditing ? (
        <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="text-xs h-10 border rounded px-2 py-1 bg-white"
        >
            <option value="applied">Отклик</option>
            <option value="interview">Интервью</option>
            <option value="offer">Оффер</option>
            <option value="rejected">Отказ</option>
            <option value="unknown">Не обработано</option>
        </select>
    ) : (
        <div className="cursor-pointer " onClick={() => setIsEditing(true)}>
            <StatusBadge status={status}  />
        </div>
    )
}

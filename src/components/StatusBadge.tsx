import { ReactNode } from "react"

interface StatusBadgeProps {
    status: string | null
}

const statusMap: Record<
    string,
    { label: string; className: string; icon: ReactNode }
> = {
    applied: {
        label: "Отклик",
        className: "bg-blue-100 text-blue-800",
        icon: "📤",
    },
    interview: {
        label: "Интервью",
        className: "bg-purple-100 text-purple-800",
        icon: "🎤",
    },
    offer: {
        label: "Оффер",
        className: "bg-green-100 text-green-800",
        icon: "🎉",
    },
    rejected: {
        label: "Отказ",
        className: "bg-red-100 text-red-800",
        icon: "❌",
    },
    unknown: {
        label: "Не обработано",
        className: "bg-yellow-100 text-yellow-800",
        icon: "🕓",
    },
    null: {
        label: "Не указано",
        className: "bg-gray-100 text-gray-800",
        icon: "❔",
    },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const { label, className, icon } =
    statusMap[status ?? "null"] || statusMap.null

    return (
        <div className={`text-xs px-2 min-w-32 min-h-10 py-1 rounded inline-flex items-center justify-center gap-1 ${className}`}>
            {label}
      <span>{icon}</span>

        </div>
    )
}

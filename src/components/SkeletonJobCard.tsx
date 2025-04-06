import { Skeleton } from "@/components/ui/skeleton"

export const SkeletonJobCard = () => {
    return (
        <div className="border p-4 rounded shadow space-y-2">
            <div className="flex justify-between">
                <div>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
                <Skeleton className="h-6 w-20 rounded" />
            </div>
            <Skeleton className="h-3 w-24 mt-4" />
        </div>
    )
}

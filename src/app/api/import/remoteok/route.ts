import { NextResponse } from "next/server"

export async function GET() {
    const res = await fetch("https://remoteok.com/api")

    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    const data = await res.json()

    const jobs = data
        .slice(1) 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((job: any) => ({
            id: job.id,
            title: job.position || job.title,
            company: job.company,
            link: job.url,
            tags: job.tags,
        }))

    return NextResponse.json(jobs)
}

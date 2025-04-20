import {NextResponse} from "next/server"
import * as cheerio from "cheerio"

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
        return NextResponse.json({error: "No URL provided"}, {status: 400})
    }

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)",
                Accept: "text/html",
            },
        })

        if (!res.ok) {
            return NextResponse.json({error: "Failed to fetch page"}, {status: 500})
        }

        const html = await res.text()
        const $ = cheerio.load(html)

        const title = $("title").first().text().trim()
        let company = ""

        const candidates = [
            $('[data-testid="company-name"]').first().text().trim(),
            $('[class*="company"]').first().text().trim(),
            $('[aria-label*="company"]').first().text().trim(),
        ]

        for (const c of candidates) {
            if (
                c &&
                !c.toLowerCase().includes("you may also apply") &&
                c.length > 1 &&
                c.length < 100
            ) {
                company = c
                break
            }
        }

        let description = ""
        const selectors = [
            '[data-testid="job-description"]',
            ".job-description",
            ".description",
            "section.job-content",
            "article",
            "main",
        ]

        for (const selector of selectors) {
            const block = $(selector).first()
            if (block && block.text().trim().length > 50) {
                const lines: string[] = []

                block.contents().each((_, el) => {
                    const line = $(el).text().trim()
                    if (line) {
                        lines.push(line)
                    }
                })

                description = lines.join("\n\n").replace(/\u00A0/g, " ")
                break
            }

        }

        if (!description && !url.includes("linkedin.com")) {
            description = $('meta[name="description"]').attr("content") || ""
        }

        let location = ""
        const locCandidates = [
            $('[data-testid*="location"]').first().text().trim(),
            $('[class*="location"]').first().text().trim(),
        ]

        for (const loc of locCandidates) {
            if (
                loc &&
                !/clear text/i.test(loc) &&
                loc.length > 1 &&
                loc.length < 100
            ) {
                location = loc
                break
            }
        }
        let salary = ""
        const salaryByLabel = description.match(/Salary[:\s]*([\s\S]{5,200})/i)

        if (salaryByLabel) {
            const raw = salaryByLabel[1].trim()
            salary = raw
                .split(/[\n\r.]/)[0]
                .split(/We offer|Benefits|Perks/i)[0]
                .trim()
        }

        if (!salary) {
            const euroMatch = description.match(/[\d.,]+\s*€\s*(–|-|to)?\s*[\d.,]+\s*€/)
            if (euroMatch) {
                salary = euroMatch[0].trim()
            }
        }

        if (description) {
            const match = description.match(/Salary[:\s]*([\s\S]{5,200})/i)
            if (match) {
                const raw = match[1].trim()
                salary = raw
                    .split(/[\n\r.]/)[0]
                    .split(/We offer|Benefits|Perks/i)[0]
                    .trim()
            }
        }

        const tagsSet = new Set<string>()
        $('[class*="tag"], [data-testid*="tag"], .badge').each((_, el) => {
            const text = $(el).text().trim()
            if (text && text.length < 40) {
                tagsSet.add(text)
            }
        })
        const tags = Array.from(tagsSet)


        return NextResponse.json({
            title,
            company,
            description,
            location,
            salary,
            tags,
        })
    } catch (err: unknown) {
        console.error("Parse error:", err)
        return NextResponse.json({error: "Failed to parse page"}, {status: 500})
    }
}

'use client'
import Image from "next/image"
import type { Dictionary } from "@/app/[lang]/dictionaries"

export default function Portrait({ portrait }: { portrait: Dictionary["portrait"] }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="border border-line rounded-sm">
                <Image src="/profile.jpeg" alt="Portrait" width={300} height={300} />
            </div>
            <div className="border border-line px-2 py-1 rounded-sm text-center flex items-center justify-center gap-2">
                <span className="lozenge" />
                <p className="">{portrait.available}</p>
            </div>
        </div>
    )
}
"use client"

import type { Dictionary } from "@/app/[lang]/dictionaries"
import Image from "next/image"


interface AcademicInfoProps {
    academicInfo: Dictionary["academicInfo"],
    status: Dictionary["status"]
}

interface academicInfoItem {
    degree: string,
    institution: string,
    status: string,
    period: string,
    conclusionDate: string
}

export default function AcademicInfo() {

    return (
        <div className="flex flex-row gap-4 border border-line w-[50%] p-5 bg-[var(--bg-2)]">
            <div>
                <div className="w-22 h-22 flex items-center justify-center p-2">
                    <Image
                        src="/instituitions/puc-minas.png"
                        alt="puc"
                        width="60"
                        height="60"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-4">
                    {/* Will display the small sphere when the course is onGoing, instead it'll just display the status */}
                    <div className="flex flex-row gap-2 items-center">
                        <span
                            style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "oklch(0.72 0.13 150)",
                                boxShadow: "0 0 0 3px oklch(0.72 0.13 150 / 0.2)",
                                flexShrink: 0,
                            }}
                        />
                        <p className="text-accent-bright font-alt">Em andamento</p>

                    </div>
                    <p className="text-faint">Dez 2026</p>
                </div>
                <h3 className="font-caps text-[24px] font-bold">Bacharelado em Engenharia de Software</h3>
                <div>
                    <h3 className="text-accent-bright text">PUC Minas</h3>
                    <p className="text-alt font-alt">Pontificia universidade católica de Minas Gerais</p>
                </div>
                <div className="flex flex-row gap-4 text-faint">
                    <p>Jan 2023 - Dez 2026</p>
                    -
                    <p>Belo Horizonte - MG</p>
                </div>
            </div>
        </div>
    )

}
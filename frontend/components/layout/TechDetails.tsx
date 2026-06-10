"use client"

import type { Dictionary } from "@/app/[lang]/dictionaries"

interface TechDetailsProps {
    tech: Dictionary["tech"]
    labels: Dictionary["tech_groups"]
}

export default function TechDetails({ tech, labels }: TechDetailsProps) {

    const elements = [
        {
            key: "languages" as const,
            technologies: [
                'tech.languages.javascript',
                'tech.languages.typescript',
                'tech.languages.java',
                'tech.languages.csharp'
            ]
        },
        {
            key: "backend" as const,
            technologies: [
                'tech.backend.nodejs',
                'tech.backend.nestjs',
                'tech.backend.express',
                'tech.backend.apiRest',
                'tech.backend.microservices',
                'tech.database.sql',
                'tech.database.postgresql',
                'tech.database.typeorm'
            ]
        },
        {
            key: "frontend" as const,
            technologies: [
                'tech.frontend.react',
                'tech.frontend.nextjs',
                'tech.frontend.vuejs',
                'tech.frontend.nuxtjs',
                'tech.frontend.tailwind',
                'tech.frontend.html5',
                'tech.frontend.css3'
            ]
        },
        {
            key: "devops" as const,
            technologies: [
                'tech.devops.docker',
                'tech.devops.cicd',
                'tech.devops.gcp',
                'tech.devops.cloudflare',
                'tech.devops.linux'
            ]
        },
        {
            key: "methodologies" as const,
            technologies: [
                'tech.methodologies.agile',
                'tech.methodologies.dataModeling',
                'tech.methodologies.analytics'
            ]
        }
    ]

    const getTechTranslation = (key: string) => {
        const parts = key.split('.')
        if (parts[0] === 'tech' && parts.length === 3) {
            const category = parts[1] as keyof typeof tech
            const item = parts[2] as keyof typeof tech[typeof category]
            return tech[category]?.[item] || key
        }
        return key
    }

    return (
        <div
            className="tech-grid"
            style={{
                display: "grid",
                gap: "1px",
                background: "var(--line-soft)",
                border: "1px solid var(--line-soft)",
            }}
        >
            {elements.map((element) => (
                <div
                    key={element.key}
                    className="flex flex-col gap-3 p-4 sm:p-5"
                    style={{ background: "var(--bg)" }}
                >
                    {/* Cabeçalho do grupo */}
                    <h3
                        className="text-[11px] uppercase tracking-[.18em]"
                        style={{
                            fontFamily: "var(--font-caps)",
                            color: "var(--gold)",
                            borderBottom: "1px solid var(--line-soft)",
                            paddingBottom: "8px",
                        }}
                    >
                        {labels[element.key]}
                    </h3>

                    {/* Lista de tecnologias */}
                    <ul className="flex flex-col gap-[6px]">
                        {element.technologies.map((technology) => (
                            <li
                                key={technology}
                                className="flex items-center gap-2 text-[13px] sm:text-[14px]"
                                style={{ color: "var(--muted)", lineHeight: "1.4" }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: "4px",
                                        height: "4px",
                                        background: "var(--accent)",
                                        transform: "rotate(45deg)",
                                        flexShrink: 0,
                                        opacity: 0.7,
                                    }}
                                />
                                {getTechTranslation(technology)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}

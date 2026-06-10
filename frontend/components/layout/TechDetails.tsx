"use client"

import type { Dictionary } from "@/app/[lang]/dictionaries"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table"

interface TechDetailsProps {
    tech: Dictionary["tech"]
}

export default function TechDetails({ tech }: TechDetailsProps) {

    const elements = [
        {
            name: 'Languages',
            technologies: [
                'tech.languages.javascript',
                'tech.languages.typescript',
                'tech.languages.java',
                'tech.languages.csharp'
            ]
        },
        {
            name: 'Backend & Database',
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
            name: 'Frontend',
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
            name: 'DevOps & Cloud',
            technologies: [
                'tech.devops.docker',
                'tech.devops.cicd',
                'tech.devops.gcp',
                'tech.devops.cloudflare',
                'tech.devops.linux'
            ]
        },
        {
            name: 'Methodologies',
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-row">
                {elements.map((element) => (
                    <div key={element.name} className="flex flex-col border border-line-soft p-4 w-full">
                        <h2 className="text-lg text-center text-gold">{element.name}</h2>
                        <ul>
                            {element.technologies.map((technology) => (
                                <li key={technology}>{getTechTranslation(technology)}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
import type { ExperienceEntry } from "@/components/ui/ExperienceTimeline"

/**
 * Dados de experiência profissional.
 * Ordem: mais recente → mais antiga.
 *
 * Para adicionar uma nova entrada, basta inserir um objeto
 * seguindo o tipo ExperienceEntry no início do array.
 */
export const EXPERIENCE: ExperienceEntry[] = [
  {
    role: "Desenvolvedor Full Stack",
    company: "Etus Media Holding",
    period: "jan 2024 — mai 2026",
    range: "2 anos · 5 meses",
    location: "Belo Horizonte, MG",
    desc: "Atuação completa no ciclo de desenvolvimento de uma plataforma web de grande escala em Vue.js, NestJS, TypeORM e PostgreSQL — da modelagem de dados à estruturação da arquitetura lógica.",
    points: [
      "Concebi e arquitetei um gerador dinâmico de páginas estáticas integrado a buckets da Google Cloud Platform e ao Cloudflare, resultando em mais de 100 páginas de alta performance distribuídas e operadas em 26 países.",
      "Otimizei a performance web, alcançando scores de 90–96% no Lighthouse e reduzindo o fluxo completo de publicação para 30 a 40 segundos.",
      "Criei e mantive pipelines automatizadas de CI/CD e apoiei a gestão da infraestrutura em nuvem, garantindo entregas contínuas seguras em múltiplos ambientes.",
      "Implementei integrações de marketing digital e analytics (Google Ads, TikTok Ads, Facebook Ads, Google Analytics e GTM), analisando métricas via consultas analíticas em SQL.",
    ],
    stack: ["Vue.js", "NestJS", "TypeORM", "PostgreSQL", "GCP", "Cloudflare", "CI/CD"],
  },
]

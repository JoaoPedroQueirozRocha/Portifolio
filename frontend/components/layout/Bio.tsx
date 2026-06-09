import type { Dictionary } from "@/app/[lang]/dictionaries"

interface BioProps {
  hero: Dictionary["hero"]
}

export default function Bio({ hero }: BioProps) {
  return (
    <div className="flex flex-col gap-3 max-w-[500px]">
      <span className="eyebrow">
        <span className="lozenge" />
        {hero.eyebrow}
      </span>
      <h1
        className="text-[78px] leading-[0.96] tracking-[.01em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        João Pedro
      </h1>
      <p
        className="text-[20px] italic mt-2"
        style={{ fontFamily: "var(--font-alt)", color: "var(--faint)" }}
      >
        {hero.bio}
      </p>
      <p
        className="text-[16px] italic"
        style={{ fontFamily: "var(--font-alt)", color: "var(--faint)" }}
      >
        {hero.bio_short}
      </p>
      <div className="flex gap-3 mt-4">
        <button
          className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] font-medium tracking-[.01em] transition-all hover:-translate-y-px"
          style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-body)" }}
        >
          {hero.cta_projects}
        </button>
        <button
          className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-sm text-[15px] tracking-[.01em] transition-all hover:text-[--accent-bright]"
          style={{ border: "1px solid var(--line)", fontFamily: "var(--font-body)" }}
        >
          {hero.cta_contact}
        </button>
      </div>
    </div>
  )
}

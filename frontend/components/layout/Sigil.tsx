export default function Sigil() {
  return (
    <span
      className="relative inline-grid place-items-center shrink-0"
      aria-hidden="true"
      style={{ width: 14, height: 14, border: "1px solid var(--accent)", borderRadius: "50%" }}
    >
      <span className="absolute w-full h-px" style={{ background: "var(--accent)", opacity: 0.45 }} />
      <span className="absolute w-px h-full" style={{ background: "var(--accent)", opacity: 0.45 }} />
      <span className="z-10" style={{ width: 4, height: 4, background: "var(--accent)", transform: "rotate(45deg)" }} />
    </span>
  )
}

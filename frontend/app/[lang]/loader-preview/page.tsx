'use client'

import { AstrolabeLoader } from '@/components/ui/AstrolabeLoader'
import { useState } from 'react'

export default function LoaderPreview() {
  const [key, setKey] = useState(0)

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '64px', alignItems: 'center' }}>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--accent)', letterSpacing: '.02em' }}>
        AstrolabeLoader — Preview
      </h1>

      {/* Tamanho padrão (380) com progresso */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.1em', color: 'var(--faint)', textTransform: 'uppercase' }}>size=380 · showProgress</span>
        <AstrolabeLoader key={key} size={380} label="Carregando" duration={5000} showProgress />
      </div>

      {/* Tamanho médio (200) sem progresso — para elementos */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.1em', color: 'var(--faint)', textTransform: 'uppercase' }}>size=200 · sem progresso</span>
        <AstrolabeLoader size={200} label="Aguarde" showProgress={false} duration={99999} />
      </div>

      {/* Tamanho pequeno (100) — inline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '.1em', color: 'var(--faint)', textTransform: 'uppercase' }}>size=100 · sem label · sem progresso</span>
        <AstrolabeLoader size={100} label="" showProgress={false} duration={99999} />
      </div>

      <button
        onClick={() => setKey(k => k + 1)}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '.1em',
          padding: '8px 20px', border: '1px solid var(--line)', color: 'var(--muted)',
          borderRadius: '3px', cursor: 'pointer', textTransform: 'uppercase',
        }}
      >
        Reiniciar animação
      </button>

    </div>
  )
}

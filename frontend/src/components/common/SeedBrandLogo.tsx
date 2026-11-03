import React from 'react';

export interface SeedBrandLogoProps {
  /** Tamanho do símbolo em pixels (padrão 22) */
  size?: number;
  /** Cor do símbolo quando não for fundo sólido (padrão '#10B981') */
  color?: string;
  /** Se deve exibir o texto da marca 'Seed' ao lado */
  showText?: boolean;
  /** Se deve exibir o subtítulo 'Agro Intelligence' */
  showSubtitle?: boolean;
  /** Se deve exibir o badge 'OS' ao lado do nome Seed */
  showBadge?: boolean;
  /** Estilo de caixa contenedora: 'solid' (verde esmeralda), 'glass' (vidro translúcido escuro) ou false */
  boxed?: boolean | 'solid' | 'glass';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Logotipo Oficial do Seed (Agro Intelligence OS) - Conceito GIS Radar Seed.
 * Sintetiza o radar satelital (4 arcos periféricos) com o núcleo germinativo (gota/semente central).
 */
export const SeedBrandLogo: React.FC<SeedBrandLogoProps> = ({
  size = 22,
  color = '#10B981',
  showText = true,
  showSubtitle = true,
  showBadge = false,
  boxed = 'solid',
  className = '',
  style,
}) => {
  const isSolid = boxed === true || boxed === 'solid';
  const isGlass = boxed === 'glass';
  const hasBox = isSolid || isGlass;

  const symbolFill = isSolid ? '#09090B' : color;

  const symbolSvg = (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      fill={symbolFill}
      role="img"
      aria-label="Seed Logo"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* 4 Quadrantes de Radar Satelital / Talhões de Alta Precisão */}
      <path d="M 120 28 A 100 100 0 0 0 28 120 L 60 120 A 68 68 0 0 1 120 60 Z" />
      <path d="M 136 60 A 68 68 0 0 1 196 120 L 228 120 A 100 100 0 0 0 136 28 Z" />
      <path d="M 60 136 L 28 136 A 100 100 0 0 0 120 228 L 120 196 A 68 68 0 0 1 60 136 Z" />
      <path d="M 196 136 A 68 68 0 0 1 136 196 L 136 228 A 100 100 0 0 0 228 136 Z" />
      {/* Semente / Gota Central: Núcleo Germinativo de Dados */}
      <path d="M 128 72 C 142 98 154 118 154 132 C 154 146 142 158 128 158 C 114 158 102 146 102 132 C 102 118 114 98 128 72 Z" />
    </svg>
  );

  return (
    <div
      className={`seed-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: hasBox ? '12px' : '10px',
        userSelect: 'none',
        ...style,
      }}
    >
      {hasBox ? (
        <div
          style={{
            width: size + 12,
            height: size + 12,
            borderRadius: '9px',
            background: isSolid
              ? 'var(--accent, #10B981)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.06) 100%)',
            border: isGlass ? '1px solid rgba(16, 185, 129, 0.35)' : 'none',
            display: 'grid',
            placeItems: 'center',
            boxShadow: isSolid
              ? '0 2px 10px rgba(16, 185, 129, 0.35)'
              : '0 0 16px rgba(16, 185, 129, 0.2)',
            flexShrink: 0,
          }}
        >
          {symbolSvg}
        </div>
      ) : (
        symbolSvg
      )}

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: Math.max(16, Math.round(size * 0.78)) + 'px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
              }}
            >
              Seed
            </span>
            {showBadge && (
              <span
                style={{
                  fontSize: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                OS
              </span>
            )}
          </div>
          {showSubtitle && (
            <span
              style={{
                fontSize: '10.5px',
                color: 'var(--text-muted, #A1A1AA)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '1px',
                fontWeight: 600,
              }}
            >
              Agro Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';

interface SeedAiLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

/**
 * Logotipo proprietário do Copiloto Agro IA (Seed Agro Intelligence).
 * Emblema vetorial geométrico fundindo broto/folha de precisão agrícola
 * com conexões neurais e facetas de inteligência computacional.
 */
export const SeedAiLogo: React.FC<SeedAiLogoProps> = ({
  size = 20,
  className = '',
  glow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Seed Agro AI Logo"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        filter: glow ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.45))' : 'none',
      }}
    >
      <defs>
        {/* Gradiente da pétala esquerda */}
        <linearGradient id="seedAiGradLeft" x1="6" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Gradiente da pétala direita */}
        <linearGradient id="seedAiGradRight" x1="26" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* Gradiente do núcleo neural */}
        <linearGradient id="seedAiGradCore" x1="16" y1="9" x2="16" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Pétala / Asa Esquerda (Folha Biométrica) */}
      <path
        d="M16 3C11 7 5 13 5 19.5C5 24.5 8.5 28 14 28.8C13 25.5 13.5 21 15 17C15.8 14.8 16.5 10 16 3Z"
        fill="url(#seedAiGradLeft)"
        opacity="0.95"
      />

      {/* Pétala / Asa Direita (Folha Biométrica em Espelho) */}
      <path
        d="M16 3C21 7 27 13 27 19.5C27 24.5 23.5 28 18 28.8C19 25.5 18.5 21 17 17C16.2 14.8 15.5 10 16 3Z"
        fill="url(#seedAiGradRight)"
        opacity="0.88"
      />

      {/* Nervura Central Neural (Trilha de Circuito Integrado) */}
      <path
        d="M16 5V28"
        stroke="url(#seedAiGradCore)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Ramificações Neurais Superiores */}
      <path
        d="M16 11L11.5 8M16 11L20.5 8"
        stroke="url(#seedAiGradCore)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Ramificações Neurais Centrais */}
      <path
        d="M16 17L9.5 14.5M16 17L22.5 14.5"
        stroke="url(#seedAiGradCore)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Nós / Sinapses (Pontos Neurais de Agrointeligência) */}
      <circle cx="11.5" cy="8" r="1.4" fill="#ecfdf5" />
      <circle cx="20.5" cy="8" r="1.4" fill="#ecfdf5" />
      <circle cx="9.5" cy="14.5" r="1.4" fill="#ecfdf5" />
      <circle cx="22.5" cy="14.5" r="1.4" fill="#ecfdf5" />
      <circle cx="16" cy="11" r="1.6" fill="#ffffff" />
      <circle cx="16" cy="17" r="1.6" fill="#ffffff" />

      {/* Vértice Inferior - Núcleo da Semente Germinada */}
      <circle cx="16" cy="24" r="1.8" fill="#a7f3d0" />
    </svg>
  );
};

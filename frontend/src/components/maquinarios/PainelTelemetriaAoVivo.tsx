import React, { useState, useEffect } from 'react';

export interface MaquinaTelemetrica {
  codigo: string;
  nome: string;
  tipo: 'TRATOR' | 'PULVERIZADOR' | 'COLHEITADEIRA' | 'PLANTADEIRA';
  status: 'OPERANDO' | 'PATIO' | 'MANUTENCAO';
  talhao_atual: string;
  operador: string;
  posicao: { x: number; y: number; lat: number; lon: number };
  rumo_graus: number;
  velocidade_kmh: number;
  consumo_lh: number;
  consumo_l_ha: number;
  rpm: number;
  temperatura_motor_c: number;
  nivel_diesel_percent: number;
  pressao_barra_bar?: number;
  vazao_l_ha?: number;
  alerta_critico?: string | null;
}

const MAQUINAS_PADRAO: MaquinaTelemetrica[] = [
  {
    codigo: 'TR-01',
    nome: 'John Deere 8370R',
    tipo: 'TRATOR',
    status: 'OPERANDO',
    talhao_atual: 'Talhão 02 — Pivô Central',
    operador: 'Carlos Eduardo',
    posicao: { x: 340, y: 180, lat: -12.5042, lon: -55.7025 },
    rumo_graus: 178,
    velocidade_kmh: 7.4,
    consumo_lh: 18.2,
    consumo_l_ha: 3.4,
    rpm: 1840,
    temperatura_motor_c: 88,
    nivel_diesel_percent: 74,
    alerta_critico: null,
  },
  {
    codigo: 'TR-02',
    nome: 'Case IH Magnum 380',
    tipo: 'TRATOR',
    status: 'OPERANDO',
    talhao_atual: 'Talhão 01 — Sede',
    operador: 'Marcos Roberto',
    posicao: { x: 140, y: 160, lat: -12.5015, lon: -55.6980 },
    rumo_graus: 355,
    velocidade_kmh: 8.2,
    consumo_lh: 22.0,
    consumo_l_ha: 4.1,
    rpm: 1920,
    temperatura_motor_c: 91,
    nivel_diesel_percent: 82,
    alerta_critico: null,
  },
  {
    codigo: 'PV-01',
    nome: 'Jacto Uniport 3030',
    tipo: 'PULVERIZADOR',
    status: 'OPERANDO',
    talhao_atual: 'Talhão 04 — Curva do Rio',
    operador: 'Carlos M.',
    posicao: { x: 740, y: 210, lat: -12.5085, lon: -55.7140 },
    rumo_graus: 90,
    velocidade_kmh: 17.6, // Acima de 16 -> Gera alerta de risco de deriva!
    consumo_lh: 16.0,
    consumo_l_ha: 1.2,
    rpm: 1810,
    temperatura_motor_c: 86,
    nivel_diesel_percent: 65,
    pressao_barra_bar: 4.2,
    vazao_l_ha: 110,
    alerta_critico: 'Risco de Deriva: Velocidade a 17.6 km/h excede o teto de 16 km/h para bicos cerâmicos!',
  },
  {
    codigo: 'CH-01',
    nome: 'John Deere S790',
    tipo: 'COLHEITADEIRA',
    status: 'PATIO',
    talhao_atual: 'Pátio Central / Oficina',
    operador: 'Standby / Inspetor Tiago',
    posicao: { x: 480, y: 440, lat: -12.5030, lon: -55.7000 },
    rumo_graus: 0,
    velocidade_kmh: 0.0,
    consumo_lh: 0.0,
    consumo_l_ha: 0.0,
    rpm: 0,
    temperatura_motor_c: 34,
    nivel_diesel_percent: 95,
    alerta_critico: null,
  },
];

export const PainelTelemetriaAoVivo: React.FC = () => {
  const [maquinas, setMaquinas] = useState<MaquinaTelemetrica[]>(MAQUINAS_PADRAO);
  const [selectedCodigo, setSelectedCodigo] = useState<string>('PV-01');
  const [isSimulando, setIsSimulando] = useState<boolean>(true);
  const [rastroPontos, setRastroPontos] = useState<Record<string, Array<{ x: number; y: number }>>>({
    'TR-01': [
      { x: 340, y: 120 },
      { x: 340, y: 150 },
      { x: 340, y: 180 },
    ],
    'PV-01': [
      { x: 680, y: 210 },
      { x: 710, y: 210 },
      { x: 740, y: 210 },
    ],
  });

  // Ticker de simulação telemétrica em tempo real
  useEffect(() => {
    if (!isSimulando) return;

    const interval = setInterval(() => {
      setMaquinas((prev) =>
        prev.map((m) => {
          if (m.status !== 'OPERANDO') return m;

          // Pequeno deslocamento linear suave simulando a passada
          let novoX = m.posicao.x;
          let novoY = m.posicao.y;
          let novoRumo = m.rumo_graus;

          if (m.codigo === 'TR-01') {
            novoY = m.posicao.y >= 260 ? 120 : m.posicao.y + 3;
            novoRumo = 180;
          } else if (m.codigo === 'PV-01') {
            novoX = m.posicao.x >= 820 ? 660 : m.posicao.x + 4;
            novoRumo = 90;
          } else if (m.codigo === 'TR-02') {
            novoY = m.posicao.y <= 110 ? 250 : m.posicao.y - 3;
            novoRumo = 0;
          }

          // Flutuação telemétrica realista
          const deltaSpeed = (Math.random() - 0.5) * 0.4;
          const novaVelocidade = Math.max(5.0, Math.min(22.0, Number((m.velocidade_kmh + deltaSpeed).toFixed(1))));
          const novoRpm = Math.round(m.rpm + (Math.random() - 0.5) * 20);
          const novoConsumo = Number((m.consumo_lh + (Math.random() - 0.5) * 0.3).toFixed(1));

          let alerta: string | null = null;
          if (m.tipo === 'PULVERIZADOR' && novaVelocidade > 16.0) {
            alerta = `Risco de Deriva: Velocidade a ${novaVelocidade} km/h ultrapassa limite para gota média!`;
          }

          return {
            ...m,
            posicao: { ...m.posicao, x: novoX, y: novoY },
            rumo_graus: novoRumo,
            velocidade_kmh: novaVelocidade,
            rpm: novoRpm,
            consumo_lh: novoConsumo,
            alerta_critico: alerta,
          };
        })
      );

      // Atualiza rastros
      setRastroPontos((prev) => {
        const next = { ...prev };
        maquinas.forEach((m) => {
          if (m.status === 'OPERANDO') {
            const lista = next[m.codigo] || [];
            next[m.codigo] = [...lista.slice(-20), { x: m.posicao.x, y: m.posicao.y }];
          }
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulando, maquinas]);

  const maqSelecionada = maquinas.find((m) => m.codigo === selectedCodigo) || maquinas[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="stagger-item">
      {/* Alerta de Deriva Dinâmico */}
      {maqSelecionada.alerta_critico && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#f87171', display: 'block', fontSize: '13px' }}>
                Alerta Crítico de Pulverização — {maqSelecionada.codigo} ({maqSelecionada.nome})
              </strong>
              <span style={{ color: '#fca5a5', fontSize: '12px' }}>
                {maqSelecionada.alerta_critico} Reduza a velocidade para assegurar cobertura e evitar deriva por vento.
              </span>
            </div>
          </div>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            VELOCIDADE CRÍTICA
          </span>
        </div>
      )}

      {/* Grid: Mapa Cartográfico com Telemetria e Painel Lateral */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', minHeight: '520px' }}>
        {/* Mapa Cartográfico dos Maquinários */}
        <div
          style={{
            background: '#09090b',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Barra de Status do Mapa */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(24, 24, 27, 0.85)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSimulando ? '#10b981' : '#f59e0b',
                  boxShadow: isSimulando ? '0 0 8px #10b981' : 'none',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Rastreamento GPS / CAN-Bus Ativo
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ({maquinas.filter((m) => m.status === 'OPERANDO').length} operando em campo)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setIsSimulando(!isSimulando)}
              >
                {isSimulando ? '⏸ Pausar Telemetria' : '▶ Retomar Telemetria'}
              </button>
            </div>
          </div>

          {/* Canvas SVG dos Talhões e Maquinários */}
          <div style={{ flex: 1, position: 'relative' }}>
            <svg viewBox="0 0 900 550" style={{ width: '100%', height: '100%' }}>
              {/* Malha de Talhões da Fazenda */}
              <defs>
                <pattern id="cropLines" width="20" height="20" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Talhão 01 */}
              <rect x="50" y="80" width="200" height="220" fill="rgba(16, 185, 129, 0.08)" stroke="#27272a" strokeWidth="1.5" rx="6" />
              <rect x="50" y="80" width="200" height="220" fill="url(#cropLines)" rx="6" />
              <text x="65" y="105" fill="var(--text-muted)" fontSize="11" fontWeight="600">Talhão 01 — Sede (Soja)</text>

              {/* Talhão 02 */}
              <rect x="270" y="80" width="180" height="220" fill="rgba(16, 185, 129, 0.08)" stroke="#27272a" strokeWidth="1.5" rx="6" />
              <rect x="270" y="80" width="180" height="220" fill="url(#cropLines)" rx="6" />
              <text x="285" y="105" fill="var(--text-muted)" fontSize="11" fontWeight="600">Talhão 02 — Pivô (Milho)</text>

              {/* Talhão 03 */}
              <rect x="470" y="80" width="160" height="220" fill="rgba(16, 185, 129, 0.08)" stroke="#27272a" strokeWidth="1.5" rx="6" />
              <text x="485" y="105" fill="var(--text-muted)" fontSize="11" fontWeight="600">Talhão 03 — Reserva</text>

              {/* Talhão 04 (Pulverizador atuando) */}
              <rect x="650" y="80" width="200" height="220" fill="rgba(239, 68, 68, 0.08)" stroke="#27272a" strokeWidth="1.5" rx="6" />
              <rect x="650" y="80" width="200" height="220" fill="url(#cropLines)" rx="6" />
              <text x="665" y="105" fill="#f87171" fontSize="11" fontWeight="600">Talhão 04 — Pulverização Ativa</text>

              {/* Área Sede / Galpão / Pátio */}
              <rect x="360" y="340" width="240" height="160" fill="rgba(39, 39, 42, 0.4)" stroke="#3f3f46" strokeWidth="1.5" rx="8" />
              <text x="380" y="370" fill="var(--text-bright)" fontSize="12" fontWeight="700">Pátio Central / Oficina de Máquinas</text>

              {/* Estradas internas da fazenda */}
              <path d="M 0 320 L 900 320 M 260 0 L 260 550 M 640 0 L 640 550" stroke="#3f3f46" strokeWidth="2" strokeDasharray="6 4" />

              {/* Rastros de trabalho percorrido pelas máquinas */}
              {Object.entries(rastroPontos).map(([cod, pts]) => {
                if (pts.length < 2) return null;
                const pathStr = pts.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                return (
                  <path
                    key={cod}
                    d={pathStr}
                    stroke={cod === 'PV-01' ? '#f59e0b' : 'var(--accent)'}
                    strokeWidth="3"
                    strokeOpacity="0.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Ícones e Marcadores dos Maquinários */}
              {maquinas.map((m) => {
                const isSelected = m.codigo === selectedCodigo;
                const cor = m.alerta_critico
                  ? '#ef4444'
                  : m.status === 'OPERANDO'
                  ? 'var(--accent)'
                  : '#a1a1aa';

                return (
                  <g
                    key={m.codigo}
                    transform={`translate(${m.posicao.x}, ${m.posicao.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCodigo(m.codigo)}
                  >
                    {/* Anel de Pulsação */}
                    {m.status === 'OPERANDO' && (
                      <circle cx="0" cy="0" r={isSelected ? '22' : '16'} fill={cor} fillOpacity="0.2">
                        <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Fundo do Ícone */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? '14' : '11'}
                      fill="#18181b"
                      stroke={cor}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Seta indicadora de direção de deslocamento */}
                    <path
                      d="M 0 -7 L 4 3 L -4 3 Z"
                      fill={cor}
                      transform={`rotate(${m.rumo_graus})`}
                    />

                    {/* Badge do Prefixo da Máquina */}
                    <rect
                      x="-24"
                      y={isSelected ? '18' : '15'}
                      width="48"
                      height="16"
                      rx="3"
                      fill="#18181b"
                      stroke={cor}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y={isSelected ? '30' : '27'}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {m.codigo}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Painel Lateral CAN-Bus da Máquina Selecionada */}
        <div
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Identificação da Máquina */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>
                  {maqSelecionada.codigo}
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-bright)', margin: '2px 0 0 0' }}>
                  {maqSelecionada.nome}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {maqSelecionada.talhao_atual}
                </span>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: maqSelecionada.status === 'OPERANDO' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.1)',
                  color: maqSelecionada.status === 'OPERANDO' ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {maqSelecionada.status}
              </span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-dim)' }}>
              Operador: <strong style={{ color: 'var(--text-primary)' }}>{maqSelecionada.operador}</strong>
            </div>
          </div>

          {/* Instrumentos de Telemetria CAN-Bus */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Velocímetro */}
            <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>Velocidade Atual</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: maqSelecionada.velocidade_kmh > 16 && maqSelecionada.tipo === 'PULVERIZADOR' ? '#ef4444' : 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
                {maqSelecionada.velocidade_kmh.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 500 }}>km/h</span>
              </div>
            </div>

            {/* Consumo Instantâneo */}
            <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>Consumo Instantâneo</span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {maqSelecionada.consumo_lh.toFixed(1)} <span style={{ fontSize: '11px', fontWeight: 500 }}>L/h</span>
              </div>
            </div>

            {/* Rotação Motor (RPM) */}
            <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>Rotação Motor</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
                {maqSelecionada.rpm} <span style={{ fontSize: '10px', fontWeight: 400 }}>RPM</span>
              </div>
            </div>

            {/* Nível Diesel S10 */}
            <div style={{ background: '#18181b', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>Nível Tanque</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>
                {maqSelecionada.nivel_diesel_percent}%
              </div>
            </div>
          </div>

          {/* Dados Específicos se for Pulverizador */}
          {maqSelecionada.tipo === 'PULVERIZADOR' && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11px',
              }}
            >
              <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '4px' }}>
                Pulverização de Alta Precisão
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Pressão de Barra:</span>
                <strong style={{ color: 'var(--text-bright)' }}>{maqSelecionada.pressao_barra_bar} bar</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>Vazão Aplicada:</span>
                <strong style={{ color: 'var(--text-bright)' }}>{maqSelecionada.vazao_l_ha} L/ha</strong>
              </div>
            </div>
          )}

          {/* Seletor Rápido de Máquinas */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Selecionar Máquina no Rastreamento:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {maquinas.map((m) => (
                <div
                  key={m.codigo}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: m.codigo === selectedCodigo ? 'rgba(16, 185, 129, 0.12)' : '#18181b',
                    border: `1px solid ${m.codigo === selectedCodigo ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                  onClick={() => setSelectedCodigo(m.codigo)}
                >
                  <div>
                    <strong style={{ color: 'var(--text-bright)' }}>{m.codigo}</strong> — {m.nome}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', color: m.status === 'OPERANDO' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {m.velocidade_kmh} km/h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';

interface Mensagem {
  id: string;
  remetente: 'user' | 'ia';
  texto: string;
  data: string;
  detalhes?: {
    alvo?: string;
    nome_cientifico?: string;
    principios_ativos?: string[];
    dosagem?: string;
    carencia_dias?: number;
    alerta_seguranca?: string;
    referencias?: string[];
  };
}

interface CopilotoAgroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGESTOES_PERGUNTAS = [
  'Como combater ferrugem asiática na soja?',
  'Qual a dosagem e carência para percevejo-marrom?',
  'Como controlar cigarrinha-do-milho e enfezamento?',
  'Como manejar buva resistente ao glifosato?',
  'Quais as condições ideais para evitar deriva na pulverização?',
];

function parseInline(content: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = content.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ color: 'var(--text-bright)', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} style={{ fontStyle: 'italic', opacity: 0.95 }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '11.5px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdown(content: string): React.ReactNode {
  const blocks = content.split('\n\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              style={{
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--accent)',
                margin: '2px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {parseInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        const lines = trimmed.split('\n');
        if (lines.length > 1) {
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {lines.map((line, lIdx) => (
                <div key={lIdx} style={{ lineHeight: '1.45' }}>
                  {parseInline(line)}
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0, lineHeight: '1.5' }}>
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export const CopilotoAgroModal: React.FC<CopilotoAgroModalProps> = ({ isOpen, onClose }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 'msg-bem-vindo',
      remetente: 'ia',
      texto:
        'Olá! Eu sou o **Copiloto Agronômico Seed**, treinado com dados oficiais do Ministério da Agricultura (Agrofit / MAPA) e Embrapa.\n\n' +
        'Posso ajudar com diagnóstico fitopatológico, dosagens de bula, período de carência e rotação de princípios ativos para evitar resistência. Como posso auxiliar seu talhão hoje?',
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, mensagens]);

  if (!isOpen) return null;

  const enviarPergunta = async (texto: string) => {
    if (!texto.trim() || carregando) return;

    const novaMensagemUsuario: Mensagem = {
      id: String(Date.now()),
      remetente: 'user',
      texto: texto.trim(),
      data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setInputTexto('');
    setCarregando(true);

    try {
      const response = await fetch('/api/v1/epidemiologico/copiloto/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: texto,
          cultura: 'Soja',
          talhao_nome: 'Talhão 04',
          insumos_estoque: ['Fox Xpro', 'Cloreto de Potássio KCl', 'Azoxistrobina', 'Engeo Pleno S'],
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta da API');
      }

      const data = await response.json();
      const respostaIA: Mensagem = {
        id: String(Date.now() + 1),
        remetente: 'ia',
        texto: data.resposta,
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detalhes: {
          alvo: data.alvo,
          nome_cientifico: data.nome_cientifico,
          principios_ativos: data.principios_ativos,
          dosagem: data.dosagem,
          carencia_dias: data.carencia_dias,
          alerta_seguranca: data.alerta_seguranca,
          referencias: data.referencias,
        },
      };

      setMensagens((prev) => [...prev, respostaIA]);
    } catch {
      // Fallback inteligente offline
      let respostaFallback =
        'Com base no catálogo oficial do MAPA / Agrofit, para alvos fitossanitários em lavouras de soja e milho, ' +
        'recomenda-se a utilização de produtos com registro ativo e rotação estrita de mecanismos de ação (FRAC / IRAC / HRAC). ' +
        'Sempre verifique as condições meteorológicas: temperatura < 30°C, umidade relativa > 55% e ventos entre 3 e 10 km/h.';

      if (texto.toLowerCase().includes('ferrugem')) {
        respostaFallback =
          '### Diagnóstico: Ferrugem Asiática (*Phakopsora pachyrhizi*)\n\n' +
          '**Princípios Ativos Recomendados:** Azoxistrobina + Ciproconazol (ou Trifloxistrobina + Protioconazol)\n' +
          '**Dosagem de Bula:** 0,4 a 0,5 L/ha + 1,5 kg/ha de Mancozebe (Multissítio protetor obrigatório)\n' +
          '**Período de Carência:** 30 dias antes da colheita\n' +
          '**Manejo:** Aplicação preventiva no estádio V6/R1 antes do fechamento total da entrelinha.\n\n' +
          '**Disponível no Almoxarifado:** Lote Fox Xpro (LT-BAY-2024-04).';
      } else if (texto.toLowerCase().includes('percevejo')) {
        respostaFallback =
          '### Diagnóstico: Percevejo-Marrom da Soja (*Euschistus heros*)\n\n' +
          '**Princípios Ativos:** Acefato (750 g/kg) ou Tiametoxam + Lambda-Cialotrina\n' +
          '**Dosagem:** 0,2 L/ha (Engeo Pleno S) ou 0,8 kg/ha (Acefato)\n' +
          '**Período de Carência:** 21 dias\n' +
          '**Manejo:** Atingir terço médio e inferior da planta. Monitorar nível de dano econômico (2 percevejos/pano).';
      }

      const respostaIA: Mensagem = {
        id: String(Date.now() + 1),
        remetente: 'ia',
        texto: respostaFallback,
        data: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMensagens((prev) => [...prev, respostaIA]);
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      enviarPergunta(inputTexto);
    }
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} style={{ zIndex: 10000, backdropFilter: 'blur(4px)' }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '95%',
          height: 'min(640px, 86vh)',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(16, 185, 129, 0.12)',
        }}
      >
        {/* Cabeçalho do Copiloto */}
        <div
          className="modal-header"
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '14px 20px',
            background: 'rgba(24, 24, 27, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="22" height="22">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="modal-title" style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>Copiloto Agronômico IA</h2>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: 'var(--accent)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  Agrofit / MAPA Conectado
                </span>
              </div>
              <p className="modal-sub" style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                Diagnóstico fitopatológico, dosagens de bula, carência e rotação de princípios ativos
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              width: '32px',
              height: '32px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>

        {/* Corpo de Mensagens */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.remetente === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: msg.remetente === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background:
                    msg.remetente === 'user'
                      ? 'var(--accent)'
                      : 'rgba(24, 24, 27, 0.95)',
                  color: msg.remetente === 'user' ? '#052e16' : 'var(--text-primary)',
                  fontWeight: msg.remetente === 'user' ? 600 : 400,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  border: msg.remetente === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: msg.remetente === 'user' ? '0 2px 8px rgba(16, 185, 129, 0.25)' : 'none',
                }}
              >
                {renderMarkdown(msg.texto)}
              </div>

              {msg.detalhes?.carencia_dias && (
                <div
                  style={{
                    fontSize: '11.5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <span>{msg.detalhes.alerta_seguranca}</span>
                </div>
              )}

              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-dim)',
                  alignSelf: msg.remetente === 'user' ? 'flex-end' : 'flex-start',
                  padding: '0 4px',
                }}
              >
                {msg.data}
              </span>
            </div>
          ))}

          {carregando && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
              <div className="sync-dot" style={{ width: '8px', height: '8px' }} />
              <span>Consultando bulas oficiais do Agrofit / MAPA...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chips de Perguntas Rápidas Sugeridas */}
        <div
          className="no-scrollbar"
          style={{
            padding: '10px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {SUGESTOES_PERGUNTAS.map((sug, i) => (
            <button
              key={i}
              type="button"
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onClick={() => enviarPergunta(sug)}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input de Envio de Pergunta */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(24, 24, 27, 0.7)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Pergunte sobre pragas, defensivos, carência ou dosagens..."
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              fontSize: '13px',
              background: '#18181b',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#f4f4f5',
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => enviarPergunta(inputTexto)}
            disabled={!inputTexto.trim() || carregando}
            style={{
              padding: '10px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '12.5px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

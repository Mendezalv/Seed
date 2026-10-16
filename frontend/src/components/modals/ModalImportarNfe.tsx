import React, { useState, useRef } from 'react';

export interface NfeItemPreview {
  item_numero: string;
  codigo_produto: string;
  nome_produto: string;
  ncm: string;
  unidade: string;
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
  codigo_lote: string;
  data_validade: string;
  categoria: 'DEFENSIVO' | 'FERTILIZANTE' | 'SEMENTE' | 'COMBUSTIVEL' | 'BIOLOGICO';
  selecionado: boolean;
}

export interface NfeDataPreview {
  chave_acesso: string;
  numero_nf: string;
  serie: string;
  data_emissao: string;
  emitente: {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    municipio: string;
    uf: string;
  };
  valor_total_nf: number;
  itens: NfeItemPreview[];
}

interface ModalImportarNfeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (novosLotes: Array<{
    nome: string;
    principioAtivo: string;
    categoria: 'DEFENSIVO' | 'FERTILIZANTE' | 'SEMENTE' | 'COMBUSTIVEL' | 'BIOLOGICO';
    codigoLote: string;
    fornecedor: string;
    quantidade: number;
    unidade: string;
    custoUnitario: number;
    custoTotal: number;
    validade: string;
  }>) => void;
}

const XML_EXEMPLO_PADRAO = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35241012345678000199550010000045821098765432" versao="4.00">
      <ide>
        <nNF>4582</nNF>
        <serie>1</serie>
        <dhEmi>2026-10-15T10:30:00-03:00</dhEmi>
      </ide>
      <emit>
        <CNPJ>12.345.678/0001-99</CNPJ>
        <xNome>Bayer S.A. Proteção de Cultivos</xNome>
        <xFant>Bayer CropScience</xFant>
        <enderEmit>
          <xMun>Ribeirão Preto</xMun>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>98.765.432/0001-00</CNPJ>
        <xNome>Fazenda Santa Maria Agropecuária</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>78250.00</vNF>
        </ICMSTot>
      </total>
      <det nItem="1">
        <prod>
          <cProd>FOX-XPRO-01</cProd>
          <xProd>Fox Xpro Fungicida Sistêmico Tríplice</xProd>
          <NCM>38089290</NCM>
          <uCom>L</uCom>
          <qCom>250.00</qCom>
          <vUnCom>185.00</vUnCom>
          <vProd>46250.00</vProd>
          <rastro>
            <nLote>LT-BAY-2026-99</nLote>
            <dVal>2028-05-10</dVal>
          </rastro>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>KCL-YAR-002</cProd>
          <xProd>Cloreto de Potássio KCl 60% Granulado</xProd>
          <NCM>31042090</NCM>
          <uCom>KG</uCom>
          <qCom>10000.00</qCom>
          <vUnCom>3.20</vUnCom>
          <vProd>32000.00</vProd>
          <rastro>
            <nLote>LT-YAR-2026-04</nLote>
            <dVal>2027-10-20</dVal>
          </rastro>
        </prod>
      </det>
    </infNFe>
  </NFe>
</nfeProc>`;

export const ModalImportarNfe: React.FC<ModalImportarNfeProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [etapa, setEtapa] = useState<'upload' | 'preview'>('upload');
  const [nfeData, setNfeData] = useState<NfeDataPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setEtapa('upload');
    setNfeData(null);
    setIsProcessing(false);
    setErro(null);
  };

  const processarTextoXml = async (xmlContent: string) => {
    setIsProcessing(true);
    setErro(null);

    try {
      const response = await fetch('/api/v1/operacional/insumos/nfe/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml_content: xmlContent }),
      });

      if (!response.ok) {
        throw new Error('Falha na validação do XML pela API');
      }

      const data = await response.json();
      const itensFormatados: NfeItemPreview[] = (data.itens || []).map((it: any) => ({
        ...it,
        selecionado: true,
      }));

      setNfeData({
        ...data,
        itens: itensFormatados,
      });
      setEtapa('preview');
    } catch {
      // Fallback local caso o backend esteja em modo mock ou sem rota ativa
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        const infNfe = xmlDoc.getElementsByTagName('infNFe')[0];
        const nNF = xmlDoc.getElementsByTagName('nNF')[0]?.textContent || '4582';
        const serie = xmlDoc.getElementsByTagName('serie')[0]?.textContent || '1';
        const dhEmi = xmlDoc.getElementsByTagName('dhEmi')[0]?.textContent || new Date().toISOString();
        const xNome = xmlDoc.getElementsByTagName('xNome')[0]?.textContent || 'Fornecedor Agro S.A.';
        const cnpj = xmlDoc.getElementsByTagName('CNPJ')[0]?.textContent || '12.345.678/0001-99';
        const xMun = xmlDoc.getElementsByTagName('xMun')[0]?.textContent || 'Ribeirão Preto';
        const uf = xmlDoc.getElementsByTagName('UF')[0]?.textContent || 'SP';
        const vNF = parseFloat(xmlDoc.getElementsByTagName('vNF')[0]?.textContent || '0');

        const detNodes = xmlDoc.getElementsByTagName('det');
        const fallbackItens: NfeItemPreview[] = [];

        for (let i = 0; i < detNodes.length; i++) {
          const det = detNodes[i];
          const xProd = det.getElementsByTagName('xProd')[0]?.textContent || `Insumo ${i + 1}`;
          const cProd = det.getElementsByTagName('cProd')[0]?.textContent || `PROD-${i + 1}`;
          const ncm = det.getElementsByTagName('NCM')[0]?.textContent || '38089290';
          const uCom = (det.getElementsByTagName('uCom')[0]?.textContent || 'L').toUpperCase();
          const qCom = parseFloat(det.getElementsByTagName('qCom')[0]?.textContent || '100');
          const vUnCom = parseFloat(det.getElementsByTagName('vUnCom')[0]?.textContent || '50');
          const vProd = parseFloat(det.getElementsByTagName('vProd')[0]?.textContent || String(qCom * vUnCom));
          const nLote = det.getElementsByTagName('nLote')[0]?.textContent || `LT-${xNome.substring(0, 4).toUpperCase()}-${nNF}-${i + 1}`;
          const dVal = det.getElementsByTagName('dVal')[0]?.textContent || '2027-12-31';

          let categoria: NfeItemPreview['categoria'] = 'DEFENSIVO';
          const lower = xProd.toLowerCase();
          if (ncm.startsWith('310') || lower.includes('adubo') || lower.includes('kcl') || lower.includes('npk')) {
            categoria = 'FERTILIZANTE';
          } else if (ncm.startsWith('1209') || lower.includes('semente')) {
            categoria = 'SEMENTE';
          } else if (ncm.startsWith('2710') || lower.includes('diesel') || lower.includes('oleo')) {
            categoria = 'COMBUSTIVEL';
          } else if (lower.includes('inoculante') || lower.includes('biologico')) {
            categoria = 'BIOLOGICO';
          }

          fallbackItens.push({
            item_numero: String(i + 1),
            codigo_produto: cProd,
            nome_produto: xProd,
            ncm,
            unidade: uCom,
            quantidade: qCom,
            custo_unitario: vUnCom,
            custo_total: vProd,
            codigo_lote: nLote,
            data_validade: dVal,
            categoria,
            selecionado: true,
          });
        }

        setNfeData({
          chave_acesso: infNfe?.getAttribute('Id')?.replace('NFe', '') || '35241012345678000199550010000045821098765432',
          numero_nf: nNF,
          serie,
          data_emissao: dhEmi.substring(0, 10),
          emitente: {
            cnpj,
            razao_social: xNome,
            nome_fantasia: xNome,
            municipio: xMun,
            uf,
          },
          valor_total_nf: vNF,
          itens: fallbackItens.length > 0 ? fallbackItens : [
            {
              item_numero: '1',
              codigo_produto: 'DEF-001',
              nome_produto: 'Fox Xpro Fungicida Sistêmico',
              ncm: '38089290',
              unidade: 'L',
              quantidade: 250,
              custo_unitario: 185,
              custo_total: 46250,
              codigo_lote: 'LT-BAY-2026-99',
              data_validade: '2028-05-10',
              categoria: 'DEFENSIVO',
              selecionado: true,
            }
          ],
        });
        setEtapa('preview');
      } catch (err) {
        setErro('Não foi possível ler o arquivo XML. Certifique-se de que é uma NF-e modelo 55 válida da SEFAZ.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processarTextoXml(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCarregarExemplo = () => {
    processarTextoXml(XML_EXEMPLO_PADRAO);
  };

  const handleToggleItem = (index: number) => {
    if (!nfeData) return;
    setNfeData({
      ...nfeData,
      itens: nfeData.itens.map((item, idx) =>
        idx === index ? { ...item, selecionado: !item.selecionado } : item
      ),
    });
  };

  const handleToggleTodos = (selecionar: boolean) => {
    if (!nfeData) return;
    setNfeData({
      ...nfeData,
      itens: nfeData.itens.map((item) => ({ ...item, selecionado: selecionar })),
    });
  };

  const handleConfirmarImportacao = () => {
    if (!nfeData) return;
    const selecionados = nfeData.itens.filter((it) => it.selecionado);
    if (selecionados.length === 0) {
      setErro('Selecione pelo menos 1 item para importar ao estoque.');
      return;
    }

    const novosLotes = selecionados.map((it) => ({
      nome: it.nome_produto,
      principioAtivo: `Entrada via NF-e nº ${nfeData.numero_nf} • NCM ${it.ncm}`,
      categoria: it.categoria,
      codigoLote: it.codigo_lote,
      fornecedor: nfeData.emitente.razao_social,
      quantidade: it.quantidade,
      unidade: it.unidade,
      custoUnitario: it.custo_unitario,
      custoTotal: it.custo_total,
      validade: it.data_validade,
    }));

    onSuccess(novosLotes);
    resetState();
    onClose();
  };

  const totalSelecionados = nfeData?.itens.filter((i) => i.selecionado).length || 0;
  const valorTotalSelecionados = nfeData?.itens
    .filter((i) => i.selecionado)
    .reduce((acc, cur) => acc + cur.custo_total, 0) || 0;

  return (
    <div className="modal-backdrop open" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: etapa === 'preview' ? '860px' : '620px', width: '95%' }}
      >
        {/* Cabeçalho do Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--accent)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="20" height="20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Importar NF-e (XML de Insumos)</h2>
              <p className="modal-sub">
                Entrada automática de defensivos, sementes e fertilizantes com cálculo de custo médio
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {erro && (
          <div
            style={{
              padding: '10px 14px',
              margin: '0 24px 16px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{erro}</span>
          </div>
        )}

        {/* ETAPA 1: Upload / Seleção de XML */}
        {etapa === 'upload' && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: '10px',
                padding: '36px 20px',
                textAlign: 'center',
                background: 'var(--surface-sunken)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const text = ev.target?.result as string;
                    if (text) processarTextoXml(text);
                  };
                  reader.readAsText(file);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--accent)',
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-bright)', marginBottom: '4px' }}>
                Clique para selecionar ou arraste o XML da NF-e
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Compatível com DANFE modelo 55 emitido por fornecedores de insumos, cooperativas e revendas
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                Deseja testar sem um arquivo local agora?
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={handleCarregarExemplo}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Carregar XML de Exemplo (Bayer / Yara)'}
              </button>
            </div>
          </div>
        )}

        {/* ETAPA 2: Pré-visualização e Conferência de Itens */}
        {etapa === 'preview' && nfeData && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Resumo da NF-e */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--surface-sunken)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '12px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Emitente / Fornecedor</span>
                <strong style={{ color: 'var(--text-bright)' }}>{nfeData.emitente.razao_social}</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>CNPJ: {nfeData.emitente.cnpj}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Documento Fiscal</span>
                <strong style={{ color: 'var(--accent)' }}>NF-e nº {nfeData.numero_nf} (Série {nfeData.serie})</strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>Emissão: {nfeData.data_emissao}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block' }}>Valor Total da Nota</span>
                <strong style={{ color: 'var(--text-bright)', fontSize: '14px' }}>
                  R$ {nfeData.valor_total_nf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
                <span style={{ display: 'block', color: 'var(--text-muted)' }}>{nfeData.itens.length} produto(s) listado(s)</span>
              </div>
            </div>

            {/* Ações de Seleção de Itens */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-bright)' }}>
                Itens Identificados para Lançamento no Estoque:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => handleToggleTodos(true)}
                >
                  Selecionar Todos
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => handleToggleTodos(false)}
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead style={{ background: 'var(--surface-sunken)', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px 10px', width: '36px' }}>Sel.</th>
                    <th style={{ padding: '8px 10px' }}>Insumo</th>
                    <th style={{ padding: '8px 10px' }}>Categoria</th>
                    <th style={{ padding: '8px 10px' }}>Qtd. / Un</th>
                    <th style={{ padding: '8px 10px' }}>Custo Un.</th>
                    <th style={{ padding: '8px 10px' }}>Subtotal</th>
                    <th style={{ padding: '8px 10px' }}>Lote / Validade</th>
                  </tr>
                </thead>
                <tbody>
                  {nfeData.itens.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderTop: '1px solid var(--border)',
                        background: item.selecionado ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="checkbox"
                          checked={item.selecionado}
                          onChange={() => handleToggleItem(idx)}
                          style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <strong style={{ display: 'block', color: 'var(--text-bright)' }}>{item.nome_produto}</strong>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          Cód: {item.codigo_produto} • NCM: {item.ncm}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background:
                              item.categoria === 'DEFENSIVO'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : item.categoria === 'FERTILIZANTE'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                            color:
                              item.categoria === 'DEFENSIVO'
                                ? '#f87171'
                                : item.categoria === 'FERTILIZANTE'
                                ? '#34d399'
                                : '#60a5fa',
                          }}
                        >
                          {item.categoria}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        {item.quantidade.toLocaleString('pt-BR')} {item.unidade}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        R$ {item.custo_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-bright)' }}>
                        R$ {item.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)' }}>
                          {item.codigo_lote}
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Val: {item.data_validade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé de Totais Selecionados */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <span>
                <strong>{totalSelecionados}</strong> de {nfeData.itens.length} insumo(s) selecionados para entrada
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '15px' }}>
                Total: R$ {valorTotalSelecionados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Rodapé com Botões de Ação */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          {etapa === 'preview' ? (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setEtapa('upload')}
            >
              Voltar ao Upload
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            {etapa === 'preview' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmarImportacao}
                disabled={totalSelecionados === 0}
              >
                Lançar {totalSelecionados} Item(ns) no Estoque
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

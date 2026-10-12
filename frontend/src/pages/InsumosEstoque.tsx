import React from 'react';

export const InsumosEstoque: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Insumos & Lotes</h1>
          <p className="page-subheading">Rastreabilidade ponta a ponta, controle de validade e alertas de estoque crítico</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Exportar Inventário</button>
          <button className="btn btn-primary">+ Entrada de Lote</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Valor em Estoque</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">R$ 247.8 <span className="suffix">mil</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">23 lotes armazenados</span>
            <span className="kpi-badge amber">3 em nível baixo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Defensivos & Fertilizantes</span>
            <div className="kpi-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">14 <span className="suffix">itens</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Rastreabilidade por talhão</span>
            <span className="kpi-badge green">Certificado</span>
          </div>
        </div>
      </div>
    </>
  );
};

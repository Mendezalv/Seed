import React from 'react';

export const VigilanciaSanitaria: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Vigilância Sanitária</h1>
          <p className="page-subheading">Monitoramento de pragas, doenças, nível de dano econômico e alertas epidemiológicos</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Mapa de Calor</button>
          <button className="btn btn-primary">+ Registrar Ocorrência</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Índice de Infestação</span>
            <div className="kpi-icon red">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">Alto <span className="suffix">(0.52)</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Talhão 04 e 07 críticos</span>
            <span className="kpi-badge red">Ação imediata</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ocorrências Ativas</span>
            <div className="kpi-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">7 <span className="suffix">registros</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Ferrugem, Percevejo, Lagarta</span>
            <span className="kpi-badge amber">Em monitoramento</span>
          </div>
        </div>
      </div>
    </>
  );
};

import React from 'react';

export const EnergiaEsg: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Energia & Sustentabilidade ESG</h1>
          <p className="page-subheading">Inventário de emissões de gases de efeito estufa (GEE), matriz renovável e elegibilidade ABC+</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Auditoria GEE</button>
          <button className="btn btn-primary">+ Emitir Laudo ESG</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Balanço de Carbono</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">-412 <span className="suffix">tCO₂e</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Sequestro líquido positivo</span>
            <span className="kpi-badge green">Carbono Negativo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Matriz Renovável</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">68.3% <span className="suffix">limpa</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Solar Fotovoltaica + Biogás</span>
            <span className="kpi-badge green">Plano ABC+</span>
          </div>
        </div>
      </div>
    </>
  );
};

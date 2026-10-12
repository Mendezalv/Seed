import React from 'react';

export const SafrasPlanejamento: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Ciclo de Safras</h1>
          <p className="page-subheading">Planejamento agronômico, janelas de plantio e previsão de colheita</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">+ Planejar Nova Safra</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Safras Ativas</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">4 <span className="suffix">safras</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Soja Verão, Milho Safrinha</span>
            <span className="kpi-badge green">Em andamento</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Produtividade Esperada</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">68.5 <span className="suffix">sc/ha</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">+4.2% acima da média regional</span>
            <span className="kpi-badge green">Alta performance</span>
          </div>
        </div>
      </div>
    </>
  );
};

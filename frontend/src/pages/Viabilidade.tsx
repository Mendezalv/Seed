import React from 'react';

export const Viabilidade: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Viabilidade Econômica</h1>
          <p className="page-subheading">Simulações de cenários de preços, margem de contribuição e ponto de equilíbrio (Break-even)</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Exportar Cenários</button>
          <button className="btn btn-primary">+ Nova Simulação</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Margem Estimada</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">34.2% <span className="suffix">líquida</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Cenário base: Soja R$ 138/sc</span>
            <span className="kpi-badge green">Alta rentabilidade</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Break-Even (Ponto Crítico)</span>
            <div className="kpi-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">44.8 <span className="suffix">sc/ha</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Custo operacional coberto</span>
            <span className="kpi-badge green">Seguro</span>
          </div>
        </div>
      </div>
    </>
  );
};

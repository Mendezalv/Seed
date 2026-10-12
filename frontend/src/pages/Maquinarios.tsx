import React from 'react';

export const Maquinarios: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Maquinários & Frotas</h1>
          <p className="page-subheading">Telemetria, horímetros, planos de manutenção preventiva e ordens de serviço</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Histórico de OS</button>
          <button className="btn btn-primary">+ Nova Ordem de Serviço</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Disponibilidade de Frota</span>
            <div className="kpi-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">75% <span className="suffix">(9/12)</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">3 em revisão preventiva</span>
            <span className="kpi-badge amber">2 ordens abertas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Custo Médio / Hora</span>
            <div className="kpi-icon amber">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">R$ 142 <span className="suffix">/h</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Diesel + Manutenção</span>
            <span className="kpi-badge green">Dentro da meta</span>
          </div>
        </div>
      </div>
    </>
  );
};

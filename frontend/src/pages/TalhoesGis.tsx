import React from 'react';

export const TalhoesGis: React.FC = () => {
  return (
    <>
      <div className="page-header stagger-item">
        <div className="page-header-left">
          <h1 className="page-heading">Talhões & GIS</h1>
          <p className="page-subheading">Mapeamento georreferenciado, topografia e mosaico de parcelas agrícolas</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">Filtrar Safras</button>
          <button className="btn btn-primary">+ Novo Talhão</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Área Total Cadastrada</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">1.420 <span className="suffix">ha</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">18 talhões georreferenciados</span>
            <span className="kpi-badge green">100% PostGIS</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">NDVI Médio</span>
            <div className="kpi-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <div className="kpi-value">0.74 <span className="suffix">vigor</span></div>
          <div className="kpi-footer">
            <span className="kpi-detail">Sentinel-2 (L2A)</span>
            <span className="kpi-badge green">Vigor Bom</span>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <div className="section-title">Visualizador Cartográfico GIS</div>
        </div>
        <div className="section-body">
          <div
            style={{
              height: '420px',
              background: '#121215',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ width: '40px', height: '40px', color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
            </svg>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
              Módulo GIS Georreferenciado
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', textAlign: 'center' }}>
              Camada pronta para renderizar polígonos GeoJSON/Shapefiles com dados de solo, histórico de plantio e declividade.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

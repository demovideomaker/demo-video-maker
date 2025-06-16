import React from 'react';

interface MetricsGridProps {
  selectedMetric: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ selectedMetric }) => {
  const metricsData = {
    pageviews: { current: '45,678', previous: '41,234', change: '+10.8%' },
    users: { current: '12,543', previous: '11,892', change: '+5.5%' },
    sessions: { current: '23,456', previous: '22,103', change: '+6.1%' },
    'bounce-rate': { current: '42.3%', previous: '45.6%', change: '-7.2%' }
  };

  const data = metricsData[selectedMetric as keyof typeof metricsData];

  return (
    <div className="card">
      <h3>{selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace('-', ' ')} Analysis</h3>
      
      <div className="stats-grid mt-4">
        <div className="stat-card" data-testid="metric-current">
          <h4>Current Period</h4>
          <div className="value">{data.current}</div>
        </div>
        <div className="stat-card" data-testid="metric-previous">
          <h4>Previous Period</h4>
          <div className="value">{data.previous}</div>
        </div>
        <div className="stat-card" data-testid="metric-change">
          <h4>Change</h4>
          <div className={`value ${data.change.startsWith('+') ? 'positive' : 'negative'}`}>
            {data.change}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Interactive {selectedMetric} chart would appear here
        </p>
      </div>
    </div>
  );
};

export default MetricsGrid;
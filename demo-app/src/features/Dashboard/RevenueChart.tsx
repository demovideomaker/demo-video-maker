import React from 'react';

interface RevenueChartProps {
  timeRange: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ timeRange }) => {
  return (
    <div className="card">
      <h3>Revenue Overview</h3>
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <p style={{ color: '#666' }}>Revenue chart for {timeRange}</p>
          <button 
            data-testid="chart-fullscreen"
            className="btn btn-secondary mt-4"
            onClick={() => alert('Opening fullscreen view')}
          >
            View Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
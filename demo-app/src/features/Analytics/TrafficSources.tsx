import React from 'react';

const TrafficSources: React.FC = () => {
  const sources = [
    { name: 'Organic Search', visits: '12,543', percentage: 35 },
    { name: 'Direct', visits: '8,234', percentage: 23 },
    { name: 'Social Media', visits: '6,789', percentage: 19 },
    { name: 'Referral', visits: '5,432', percentage: 15 },
    { name: 'Email', visits: '2,876', percentage: 8 },
  ];

  return (
    <div className="card">
      <h3>Traffic Sources</h3>
      <div className="mt-4">
        {sources.map((source) => (
          <div 
            key={source.name} 
            data-testid={`traffic-${source.name.toLowerCase().replace(' ', '-')}`}
            style={{ marginBottom: '16px' }}
          >
            <div className="flex justify-between mb-2">
              <span>{source.name}</span>
              <span style={{ fontWeight: 600 }}>{source.visits}</span>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
              <div 
                style={{ 
                  background: '#0070f3', 
                  width: `${source.percentage}%`, 
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s'
                }} 
              />
            </div>
          </div>
        ))}
      </div>
      <button 
        data-testid="view-traffic-details"
        className="btn btn-secondary mt-4" 
        style={{ width: '100%' }}
      >
        View Detailed Report
      </button>
    </div>
  );
};

export default TrafficSources;
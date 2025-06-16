import React from 'react';

const ConversionFunnel: React.FC = () => {
  const funnelSteps = [
    { step: 'Homepage Visit', users: '45,678', rate: 100 },
    { step: 'Product View', users: '23,456', rate: 51 },
    { step: 'Add to Cart', users: '12,345', rate: 27 },
    { step: 'Checkout', users: '8,765', rate: 19 },
    { step: 'Purchase', users: '5,432', rate: 12 },
  ];

  return (
    <div className="card">
      <h3>Conversion Funnel</h3>
      <div className="mt-4">
        {funnelSteps.map((step, index) => (
          <div 
            key={step.step}
            data-testid={`funnel-${step.step.toLowerCase().replace(/\s+/g, '-')}`}
            style={{ marginBottom: '20px' }}
          >
            <div className="flex justify-between mb-2">
              <span>
                <strong>{index + 1}.</strong> {step.step}
              </span>
              <span style={{ color: '#666' }}>{step.rate}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  background: '#0070f3', 
                  height: '30px',
                  width: `${step.rate}%`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  color: 'white',
                  fontSize: '14px'
                }}
              >
                {step.users}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        data-testid="optimize-funnel"
        className="btn btn-primary mt-4" 
        style={{ width: '100%' }}
      >
        View Optimization Tips
      </button>
    </div>
  );
};

export default ConversionFunnel;
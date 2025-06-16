import React from 'react';

interface DashboardStatsProps {
  timeRange: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ timeRange }) => {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$124,563',
      change: '+12.5%',
      positive: true,
      testId: 'stat-revenue'
    },
    {
      label: 'Active Users',
      value: '8,549',
      change: '+3.2%',
      positive: true,
      testId: 'stat-users'
    },
    {
      label: 'Conversion Rate',
      value: '3.48%',
      change: '-0.4%',
      positive: false,
      testId: 'stat-conversion'
    },
    {
      label: 'Avg. Order Value',
      value: '$78.50',
      change: '+5.3%',
      positive: true,
      testId: 'stat-order-value'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card" data-testid={stat.testId}>
          <h4>{stat.label}</h4>
          <div className="value">{stat.value}</div>
          <div className={`change ${stat.positive ? 'positive' : 'negative'}`}>
            {stat.change} from last {timeRange}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
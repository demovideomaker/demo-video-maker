import React from 'react';
import StatsCard from './StatsCard';

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatsCard title="Users" value="1,234" />
        <StatsCard title="Revenue" value="$45,678" />
        <StatsCard title="Orders" value="567" />
      </div>
      <button data-testid="refresh-stats" onClick={() => console.log('Refreshing...')}>
        Refresh Stats
      </button>
    </div>
  );
}
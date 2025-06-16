import React, { useState } from 'react';
import Layout from '@/components/Layout';
import DashboardStats from '@/features/Dashboard/DashboardStats';
import RevenueChart from '@/features/Dashboard/RevenueChart';
import ActivityFeed from '@/features/Dashboard/ActivityFeed';

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <Layout>
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1>Dashboard</h1>
            <p>Monitor your application's performance and metrics</p>
          </div>
          <select
            data-testid="time-range-selector"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <DashboardStats timeRange={timeRange} />
      
      <div className="flex gap-4">
        <div style={{ flex: 2 }}>
          <RevenueChart timeRange={timeRange} />
        </div>
        <div style={{ flex: 1 }}>
          <ActivityFeed />
        </div>
      </div>

      <div className="card mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3>Quick Actions</h3>
          <button 
            data-testid="refresh-dashboard"
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
        </div>
        <div className="flex gap-2">
          <button data-testid="export-data" className="btn btn-primary">
            Export Data
          </button>
          <button data-testid="generate-report" className="btn btn-secondary">
            Generate Report
          </button>
          <button data-testid="schedule-email" className="btn btn-secondary">
            Schedule Email
          </button>
        </div>
      </div>
    </Layout>
  );
}
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import MetricsGrid from '@/features/Analytics/MetricsGrid';
import TrafficSources from '@/features/Analytics/TrafficSources';
import ConversionFunnel from '@/features/Analytics/ConversionFunnel';

export default function AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState('pageviews');

  return (
    <Layout>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Deep dive into your application metrics and user behavior</p>
      </div>

      <div className="card mb-4">
        <h3>Metric Overview</h3>
        <div className="flex gap-2 mt-4">
          {['pageviews', 'users', 'sessions', 'bounce-rate'].map((metric) => (
            <button
              key={metric}
              data-testid={`metric-${metric}`}
              className={`btn ${selectedMetric === metric ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedMetric(metric)}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <MetricsGrid selectedMetric={selectedMetric} />

      <div className="flex gap-4 mt-4">
        <div style={{ flex: 1 }}>
          <TrafficSources />
        </div>
        <div style={{ flex: 1 }}>
          <ConversionFunnel />
        </div>
      </div>

      <div className="card mt-4">
        <h3>Export & Reports</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Generate detailed reports or export raw data for further analysis
        </p>
        <div className="flex gap-2">
          <button data-testid="export-csv" className="btn btn-primary">
            Export to CSV
          </button>
          <button data-testid="export-pdf" className="btn btn-secondary">
            Export to PDF
          </button>
          <button data-testid="schedule-report" className="btn btn-secondary">
            Schedule Report
          </button>
        </div>
      </div>
    </Layout>
  );
}
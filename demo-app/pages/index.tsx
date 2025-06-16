import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Layout>
      <div className="page-header">
        <h1>Welcome to Demo Video Maker</h1>
        <p>This demo app showcases various features for automated testing and video generation</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" data-testid="quick-stats-users">
          <h4>Total Users</h4>
          <div className="value">2,543</div>
          <div className="change positive">+12.5%</div>
        </div>
        <div className="stat-card" data-testid="quick-stats-revenue">
          <h4>Revenue</h4>
          <div className="value">$45,678</div>
          <div className="change positive">+8.2%</div>
        </div>
        <div className="stat-card" data-testid="quick-stats-orders">
          <h4>Active Orders</h4>
          <div className="value">156</div>
          <div className="change negative">-3.1%</div>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div className="flex gap-4">
          <Link href="/dashboard" className="btn btn-primary" data-testid="quick-action-dashboard">
            View Dashboard
          </Link>
          <Link href="/users" className="btn btn-secondary" data-testid="quick-action-users">
            Manage Users
          </Link>
          <Link href="/analytics" className="btn btn-secondary" data-testid="quick-action-analytics">
            View Analytics
          </Link>
        </div>
      </div>

      <div className="card mt-4">
        <h3>Recent Activity</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>Updated profile</td>
                <td>2 minutes ago</td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>Created new order</td>
                <td>5 minutes ago</td>
              </tr>
              <tr>
                <td>Bob Johnson</td>
                <td>Changed settings</td>
                <td>10 minutes ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
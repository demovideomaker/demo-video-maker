import React from 'react';

export default function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Demo App</h1>
      <nav>
        <button data-testid="dashboard-link" onClick={() => window.location.href = '/dashboard'}>
          Go to Dashboard
        </button>
        <button data-testid="profile-link" onClick={() => window.location.href = '/profile'}>
          View Profile
        </button>
      </nav>
    </div>
  );
}
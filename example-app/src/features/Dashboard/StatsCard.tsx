import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
}

export default function StatsCard({ title, value }: StatsCardProps) {
  return (
    <div className="stats-card" data-testid={`stats-${title.toLowerCase()}`}>
      <h3>{title}</h3>
      <p className="stats-value">{value}</p>
    </div>
  );
}
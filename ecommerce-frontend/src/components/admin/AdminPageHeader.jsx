import React from 'react';

// Simple, reusable page header for admin views.
// Props:
// - title: string (required)
// - subtitle: React node (optional)
// - actions: React node (optional, right-aligned)
export default function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="mb-0">{title}</h2>
        {actions || null}
      </div>
      {subtitle && (
        <p className="text-muted mb-0">{subtitle}</p>
      )}
    </div>
  );
}


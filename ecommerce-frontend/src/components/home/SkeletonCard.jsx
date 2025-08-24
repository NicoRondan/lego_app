import React from 'react';

function SkeletonCard({ height = 200 }) {
  return (
    <div className="card placeholder-glow" style={{ height }}>
      <div className="placeholder w-100 h-100" />
    </div>
  );
}

export default SkeletonCard;

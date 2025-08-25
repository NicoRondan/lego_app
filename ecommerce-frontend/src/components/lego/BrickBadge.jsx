import React from 'react';
export default function BrickBadge({children,color='warning',className=''}) {
  return <span className={`badge tile bg-${color} ${className}`}>{children}</span>;
}

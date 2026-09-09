import React from 'react';

interface GlossyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
}

/**
 * Reusable Material-3 Glossy Surface Card
 * - Solid translucent surface (var(--surface) or var(--surface-strong))
 * - Translucent border (var(--border))
 * - Soft outer shadow + subtle inner highlight
 * - 18px border radius (var(--radius-lg))
 * - Backdrop blur with graceful fallback
 * - ZERO gradients
 */
export const GlossyCard: React.FC<GlossyCardProps> = ({
  children,
  className = '',
  elevated = false,
  hoverable = false,
  ...rest
}) => {
  const baseClasses = elevated ? 'glossy-card-elevated' : 'glossy-card';
  const hoverClasses = hoverable ? 'glossy-card-hover' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
};

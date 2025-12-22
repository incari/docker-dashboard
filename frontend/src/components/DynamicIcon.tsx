import React from 'react';
import { getIconComponent } from '../constants/icons';

interface DynamicIconProps {
  name: string;
  className?: string;
}

/**
 * Dynamic icon component that renders a Lucide icon by name
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = '' }) => {
  const IconComponent = getIconComponent(name);
  return <IconComponent className={className} />;
};


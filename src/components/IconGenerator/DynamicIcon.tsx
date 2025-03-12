import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

interface DynamicIconProps {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({
  iconName,
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 0.25,
  onClick
}) => {
  const [supportsStroke, setSupportsStroke] = useState(true);
  
  // Check if the icon library supports stroke width
  useEffect(() => {
    // Most libs that support stroke usually have these prefixes
    const strokeSupportedLibs = [
      'lucide', 
      'tabler', 
      'mingcute', 
      'line-md',
      'carbon',
      'mdi-light',
      'iconoir',
      'ph',
      'solar',
      'ri',
      'uil',
      'bx'
    ];
    
    const prefix = iconName.split(':')[0];
    const hasStrokeSupport = strokeSupportedLibs.some(lib => prefix.includes(lib));
    setSupportsStroke(hasStrokeSupport);
  }, [iconName]);

  if (!iconName) {
    return null;
  }

  // Create custom styles based on the icon library
  const customStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    color: color,
    ...(supportsStroke ? {
      strokeWidth: `${strokeWidth}px`,
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    } : {})
  };

  return (
    <span 
      className={`inline-flex ${className}`}
      onClick={onClick}
      data-stroke-width={strokeWidth}
      data-library={iconName.split(':')[0]}
    >
      <Icon 
        icon={iconName} 
        width={size} 
        height={size}
        color={color}
        style={customStyles}
      />
    </span>
  );
};

export default DynamicIcon; 
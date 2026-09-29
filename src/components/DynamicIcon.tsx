import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // Convert kebab-case or lowercase to PascalCase if needed
  const pascalName = name
    ? name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    : 'Sparkles';

  // @ts-ignore
  const Resolved = (Icons as any)[name] || (Icons as any)[pascalName] || Icons.Sparkles;
  const IconComponent = typeof Resolved === 'function' || (typeof Resolved === 'object' && Resolved !== null)
    ? Resolved
    : Icons.Sparkles;

  return <IconComponent className={className} size={size} />;
};

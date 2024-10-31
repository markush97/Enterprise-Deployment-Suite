import React from 'react';
import * as Icons from 'lucide-react';
import { WikiTag } from '../../types/wiki';

interface TagBadgeProps {
  tag: WikiTag;
  className?: string;
}

export function TagBadge({ tag, className = '' }: TagBadgeProps) {
  const IconComponent = Icons[tag.icon as keyof typeof Icons];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
      }}
    >
      {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {tag.title}
    </span>
  );
}
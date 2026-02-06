'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  expandedClassName?: string;
  buttonClassName?: string;
  showLines?: number; // For line-clamp instead of character limit
}

export default function ExpandableText({
  text,
  maxLength = 100,
  className = '',
  expandedClassName = '',
  buttonClassName = 'text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1',
  showLines,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if text should be truncated
  const shouldTruncate = showLines ? text.length > maxLength : text.length > maxLength;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className="space-y-1">
      {showLines ? (
        // Use line-clamp for multi-line truncation
        <p className={`${className} ${isExpanded ? expandedClassName || 'break-words' : `line-clamp-${showLines}`}`}>
          {text}
        </p>
      ) : (
        // Use character-based truncation
        <p className={`${className} ${isExpanded ? expandedClassName || 'break-words' : 'truncate'}`}>
          {isExpanded ? text : text}
        </p>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={buttonClassName}
      >
        {isExpanded ? (
          <>
            Less <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            More <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}
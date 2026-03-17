import React from 'react';

interface Badge {
  id?: string | number;
  badge_name?: string;
  name?: string;
  badge_color?: string;
  background_color?: string;  // ✅ Добавили
  color?: string;
  badge_text_color?: string;
  text_color?: string;
}

interface UserBadgesProps {
  badges: Badge[];
  size?: 'small' | 'medium' | 'large';
  maxDisplay?: number;
}

export default function UserBadges({ badges, size = 'medium', maxDisplay = 3 }: UserBadgesProps) {
  if (!badges?.length) return null;
  
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5 !ring-1 !ring-white/20 shadow-sm',
    medium: 'text-xs px-3 py-0.5 !ring-1 !ring-white/20 shadow-sm',
    large: 'text-sm px-4 py-1 !ring-1 !ring-white/20 shadow',
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {displayBadges.map((badge, index) => {
        const name = badge.badge_name || badge.name || 'Значок';
        const bgColor = badge.badge_color || badge.background_color || badge.color || '#6366f1';
        const textColor = badge.badge_text_color || badge.text_color || '#ffffff';

        return (
          <span
            key={badge.id ?? `badge-${index}`}
            className={`inline-flex items-center font-bold rounded-full shadow-sm ${sizeClasses[size]}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
            title={name}
          >
            {name}
          </span>
        );
      })}

      {remainingCount > 0 && (
        <span className={`text-gray-500 font-medium ${sizeClasses[size]}`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

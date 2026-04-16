import React from 'react';

const ProgressBar = ({ value = 0, color = 'yellow', showLabel = true, height = 'h-2' }) => {
  const colorMap = {
    yellow: 'bg-yellow-400',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-400',
  };
  const barColor = colorMap[color] || colorMap.yellow;
  const capped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${capped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 w-8 text-right">{capped}%</span>
      )}
    </div>
  );
};

export default ProgressBar;

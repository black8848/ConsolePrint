import type { LogStatus } from '../types';
import { STATUS_CONFIG } from '../utils/statusConfig';

interface StatusBadgeProps {
  status: LogStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${config.bgColor} ${config.textColor} border ${config.borderColor}
      `}
    >
      {config.label}
    </span>
  );
}

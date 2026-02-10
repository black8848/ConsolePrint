import type { LogStatus } from '../types';

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const STATUS_CONFIG: Record<LogStatus, StatusConfig> = {
  error: {
    label: '错误',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  warning: {
    label: '警告',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  info: {
    label: '信息',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  resolved: {
    label: '已解决',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
};

export const STATUS_OPTIONS: LogStatus[] = ['error', 'warning', 'info', 'resolved'];

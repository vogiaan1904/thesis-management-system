import React from 'react';
import { RegistrationStatus } from '../../types';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface StatusBadgeProps {
  status: RegistrationStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  RegistrationStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING_INSTRUCTOR_REVIEW: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Clock className="h-4 w-4" />,
  },
  INSTRUCTOR_ACCEPTED: {
    label: 'Instructor Accepted',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  INSTRUCTOR_DENIED: {
    label: 'Instructor Denied',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-4 w-4" />,
  },
  VERIFIED: {
    label: 'Verified',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Shield className="h-4 w-4" />,
  },
  INVALID_CREDITS: {
    label: 'Invalid Credits',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  NOT_ENROLLED_EDUSOFT: {
    label: 'Not Enrolled in EDUSoft',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  DEPARTMENT_REVOKED: {
    label: 'Revoked by Department',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <XCircle className="h-4 w-4" />,
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

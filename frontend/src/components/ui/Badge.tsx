interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-indigo-50 text-indigo-700',
};

export default function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Helper to map risk/status values to badge variants
export function getRiskBadgeVariant(level?: string): Props['variant'] {
  switch (level) {
    case 'High': return 'danger';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'default';
  }
}

export function getStatusBadgeVariant(status: string): Props['variant'] {
  switch (status) {
    case 'Completed': case 'Done': return 'success';
    case 'InProgress': case 'InReview': return 'info';
    case 'OnHold': case 'Blocked': return 'warning';
    case 'Cancelled': return 'danger';
    default: return 'default';
  }
}

export function getPriorityBadgeVariant(priority: string): Props['variant'] {
  switch (priority) {
    case 'Critical': return 'danger';
    case 'High': return 'warning';
    case 'Medium': return 'info';
    case 'Low': return 'default';
    default: return 'default';
  }
}

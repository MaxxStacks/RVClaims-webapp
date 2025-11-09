interface ServiceBadgeProps {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  className?: string;
}

export function ServiceBadge({ quarter, className = '' }: ServiceBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-semibold">NEW</span>
      <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-semibold">{quarter} 2026</span>
    </span>
  );
}

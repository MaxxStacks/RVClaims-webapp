interface ServiceBadgeProps {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  className?: string;
}

export function ServiceBadge({ quarter, className = '' }: ServiceBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className}`}>
      <span className="inline-flex items-center justify-center text-[10px] bg-green-700 text-white h-[18px] w-[38px] rounded font-semibold">NEW</span>
      <span className="inline-flex items-center justify-center text-[10px] bg-primary text-white px-1.5 h-[18px] rounded font-semibold">{quarter} 2026</span>
    </span>
  );
}

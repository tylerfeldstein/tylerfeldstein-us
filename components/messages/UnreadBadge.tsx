import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  expanded?: boolean;
}

export default function UnreadBadge({ count, expanded = true }: UnreadBadgeProps) {
  if (count <= 0) return null;
  
  return (
    <span className={cn(
      "bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center",
      expanded 
        ? "absolute top-1 right-1 h-5 min-w-5 px-1" 
        : "absolute -top-1 -right-1 h-5 min-w-5 px-1"
    )}>
      {count > 99 ? "99+" : count}
    </span>
  );
} 
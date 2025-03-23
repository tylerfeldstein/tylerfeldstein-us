import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";

interface UnreadBadgeProps {
  count: number;
  expanded?: boolean;
}

// Create a styled badge with variants for expanded and collapsed states
const badgeVariants = cva(
  "flex items-center justify-center font-medium",
  {
    variants: {
      view: {
        expanded: "absolute right-2 top-2 h-5 min-w-[20px] px-1.5 rounded-full text-xs",
        compact: "absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 rounded-full text-xs",
        dot: "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full"
      }
    },
    defaultVariants: {
      view: "expanded"
    }
  }
);

export default function UnreadBadge({ count, expanded = true }: UnreadBadgeProps) {
  if (count <= 0) return null;
  
  // In collapsed view with many messages, just show a dot indicator
  if (!expanded) {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={cn(
          badgeVariants({ view: "dot" }),
          "bg-red-500 shadow-sm border border-background"
        )}
      />
    );
  }
  
  return (
    <motion.span
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={cn(
        badgeVariants({ view: expanded ? "expanded" : "compact" }),
        "bg-primary text-primary-foreground shadow-sm",
        count > 9 ? "px-1" : "" // Adjust padding for larger numbers
      )}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
} 
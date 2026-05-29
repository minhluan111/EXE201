import { cn } from "@/lib/utils";

const Select = ({ className, ...props }) => (
  <select
    className={cn(
      "flex h-10 w-full rounded-lg border-2 border-cream bg-white px-4 py-2 text-sm text-dark transition-all duration-300",
      "focus:outline-none focus:border-moss focus:ring-2 focus:ring-moss focus:ring-opacity-20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export { Select };

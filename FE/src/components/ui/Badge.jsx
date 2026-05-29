import { cn } from "@/lib/utils";

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-moss text-white",
    secondary: "bg-cream text-dark",
    outline: "border-2 border-moss text-moss",
    destructive: "bg-red-600 text-white",
    success: "bg-green-600 text-white",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
};

export { Badge };

import { cn } from "@/lib/utils";

const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-moss text-white hover:bg-forest active:scale-95 focus-visible:ring-moss",
    secondary:
      "bg-cream text-dark hover:bg-soft active:scale-95 focus-visible:ring-cream",
    outline:
      "border-2 border-moss text-moss hover:bg-moss hover:text-white active:scale-95",
    ghost:
      "text-moss hover:bg-cream hover:text-forest active:scale-95 focus-visible:ring-moss",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-base",
    sm: "h-8 px-3 py-1.5 text-sm",
    lg: "h-12 px-6 py-3 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};

export { Button };

import { cn } from "@/lib/utils";

const Tabs = ({ value, onValueChange, children, className }) => (
  <div className={cn("w-full", className)}>{children}</div>
);

const TabsList = ({ className, children, ...props }) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-cream p-1",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

const TabsTrigger = ({ value, active, onClick, children, className }) => (
  <button
    onClick={() => onClick?.(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all duration-300",
      active ? "bg-white text-moss shadow-sm" : "text-gray-600 hover:text-dark",
    )}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeValue, children, className }) => {
  if (value !== activeValue) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

import { cn } from "@/lib/utils";

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-soft bg-white p-6 shadow-card transition-all duration-300 hover:shadow-soft",
      className,
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h2
    className={cn("text-2xl font-bold tracking-tight text-dark", className)}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-gray-600", className)} {...props} />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div
    className={cn("mt-6 flex items-center justify-between", className)}
    {...props}
  />
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

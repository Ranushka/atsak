import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Spinner({ className, size = 16, ...props }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      width={size}
      height={size}
      aria-label="Loading"
      {...props}
    />
  );
}

/* __DOC
<QDS.Spinner />
DOC__ */

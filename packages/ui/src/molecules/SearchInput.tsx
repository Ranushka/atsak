import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "../atoms/Input";

export interface SearchInputProps extends InputProps {
  end?: React.ReactNode;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, end, ...props }, ref) => (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute start-3 size-4 text-muted-foreground" />
      <Input ref={ref} className={cn("ps-9", end ? "pe-9" : undefined)} {...props} />
      {end ? <div className="absolute end-2 flex items-center">{end}</div> : null}
    </div>
  )
);
SearchInput.displayName = "SearchInput";

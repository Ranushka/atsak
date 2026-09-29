import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "../atoms/Input";

export interface SearchInputProps extends InputProps {
  end?: React.ReactNode;
}

const iconInsetBySize = { sm: "start-2.5", md: "start-3", lg: "start-3.5" };
const iconSizeBySize = { sm: "size-3.5", md: "size-4", lg: "size-5" };
const paddingStartBySize = { sm: "ps-8", md: "ps-9", lg: "ps-11" };
const paddingEndBySize = { sm: "pe-8", md: "pe-9", lg: "pe-11" };

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, end, size, ...props }, ref) => {
    const resolvedSize = size ?? "md";
    return (
      <div className={cn("relative flex items-center", className)}>
        <Search
          className={cn(
            "pointer-events-none absolute text-muted-foreground",
            iconInsetBySize[resolvedSize],
            iconSizeBySize[resolvedSize]
          )}
        />
        <Input
          ref={ref}
          size={resolvedSize}
          className={cn(paddingStartBySize[resolvedSize], end ? paddingEndBySize[resolvedSize] : undefined)}
          {...props}
        />
        {end ? <div className="absolute end-2 flex items-center">{end}</div> : null}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

/* __DOC
<QDS.SearchInput placeholder="Search…" className="w-64" />
DOC__ */

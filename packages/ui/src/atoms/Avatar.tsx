import * as React from "react";
import { Avatar as RadixAvatar } from "radix-ui";
import { cn } from "../lib/cn";

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof RadixAvatar.Root> {
  src?: string;
  alt?: string;
  name?: string;
}

function initials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export const Avatar = React.forwardRef<React.ElementRef<typeof RadixAvatar.Root>, AvatarProps>(
  ({ className, src, alt, name, ...props }, ref) => (
    <RadixAvatar.Root
      ref={ref}
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    >
      {src ? <RadixAvatar.Image src={src} alt={alt ?? name ?? ""} className="size-full object-cover" /> : null}
      <RadixAvatar.Fallback className="flex size-full items-center justify-center text-xs font-medium">
        {initials(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )
);
Avatar.displayName = "Avatar";

/* __DOC
<QDS.Avatar name="Admin User" />
<QDS.Avatar name="Sara Al Farsi" />
DOC__ */

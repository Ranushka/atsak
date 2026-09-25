import * as React from "react";

export interface FlagProps extends React.SVGAttributes<SVGSVGElement> {
  title?: string;
}

export function FlagAE({ title = "United Arab Emirates", className, ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} role="img" aria-label={title} {...props}>
      <rect width="24" height="16" fill="#00732f" />
      <rect width="24" height="5.33" y="5.33" fill="#fff" />
      <rect width="24" height="5.33" y="10.67" fill="#000" />
      <rect width="6" height="16" fill="#ff0000" />
    </svg>
  );
}

export function FlagSA({ title = "Saudi Arabia", className, ...props }: FlagProps) {
  return (
    <svg viewBox="0 0 24 16" className={className} role="img" aria-label={title} {...props}>
      <rect width="24" height="16" fill="#006c35" />
      <rect x="3" y="6.5" width="14" height="1.4" fill="#fff" />
      <rect x="3" y="9" width="10" height="1.4" fill="#fff" />
    </svg>
  );
}

/* __DOC
<Finance.FlagAE className="h-6 w-9 rounded" />
<Finance.FlagSA className="h-6 w-9 rounded" />
DOC__ */

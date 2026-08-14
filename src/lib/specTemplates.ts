// Lightweight per-category markdown skeletons (OpenSpec-inspired). Purely a
// UI convenience — inserted into the editor on request, never enforced.

export const SPEC_CATEGORY_TEMPLATES: Record<string, string> = {
  product: `# Title

## Overview
_What is this product/area, and who is it for?_

## User Scenarios
- As a ..., I want to ..., so that ...

## Goals & Non-Goals
### Goals
-

### Non-Goals
-
`,

  feature: `# Title

## Overview
_What is this feature and why does it matter?_

## Requirements
-

## Edge Cases
-

## Non-Goals
-
`,

  architecture: `# Title

## Context
_What situation/problem led to this decision?_

## Decision
_What are we doing?_

## Consequences
_What becomes easier or harder as a result?_
`,

  api: `# Title

## Overview
_What does this API surface do?_

## Endpoints
- \`METHOD /path\` — description

## Request/Response Shapes
\`\`\`json
{}
\`\`\`

## Error Cases
-
`,

  decision: `# Title

## Context
_What is the situation that calls for a decision?_

## Decision
_What was decided?_

## Alternatives Considered
-

## Consequences
_What becomes easier or harder as a result?_
`,
};

export function getSpecTemplate(category: string): string {
  return SPEC_CATEGORY_TEMPLATES[category] ?? SPEC_CATEGORY_TEMPLATES.feature;
}

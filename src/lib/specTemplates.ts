// OpenSpec-structured markdown skeletons. Requirements are written as
// "### Requirement: ..." with SHALL language, backed by "#### Scenario:"
// blocks using WHEN/THEN — the same shape OpenSpec uses for spec files.
// Purely a UI convenience — inserted into the editor on request, never
// enforced. The per-category framing only changes the Purpose hint below;
// the Requirements/Scenario structure itself is the same for every category.

const PURPOSE_HINTS: Record<string, string> = {
  product: "_What is this product/area, who is it for, and why does it exist?_",
  feature: "_What capability is this, and what problem does it solve for users?_",
  architecture: "_What system concern does this capability address?_",
  api: "_What API surface does this capability expose, and to whom?_",
  decision: "_What ongoing capability or constraint does this decision establish?_",
};

function openSpecTemplate(category: string): string {
  const purposeHint = PURPOSE_HINTS[category] ?? PURPOSE_HINTS.feature;
  return `# Title

## Purpose
${purposeHint}

## Requirements

### Requirement: Name this requirement
The system SHALL ...

#### Scenario: Happy path
- WHEN ...
- THEN ...

#### Scenario: Edge case
- WHEN ...
- THEN ...
`;
}

export const SPEC_CATEGORY_TEMPLATES: Record<string, string> = {
  product: openSpecTemplate("product"),
  feature: openSpecTemplate("feature"),
  architecture: openSpecTemplate("architecture"),
  api: openSpecTemplate("api"),
  decision: openSpecTemplate("decision"),
};

export function getSpecTemplate(category: string): string {
  return SPEC_CATEGORY_TEMPLATES[category] ?? SPEC_CATEGORY_TEMPLATES.feature;
}

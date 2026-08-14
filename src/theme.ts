import { createTheme, type MantineColorsTuple } from "@mantine/core";

const brand: MantineColorsTuple = [
  "#eef3ff",
  "#dce4f5",
  "#b9c7e2",
  "#93a8d0",
  "#748dc1",
  "#5f7cb8",
  "#5474b5",
  "#44639f",
  "#39588f",
  "#294a7f",
];

export const theme = createTheme({
  primaryColor: "brand",
  colors: { brand },
  defaultRadius: "md",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: { fontWeight: "600" },
  // Mantine's default input size ("sm") renders at 14px, which is under
  // iOS Safari's 16px zoom-on-focus threshold — every text-entry field
  // auto-zooms when focused on mobile. Bumping these to "md" (16px) via
  // theme defaultProps fixes it without any custom CSS or media queries.
  components: {
    TextInput: { defaultProps: { size: "md" } },
    Textarea: { defaultProps: { size: "md" } },
    Select: { defaultProps: { size: "md" } },
    MultiSelect: { defaultProps: { size: "md" } },
    NumberInput: { defaultProps: { size: "md" } },
    PasswordInput: { defaultProps: { size: "md" } },
    Autocomplete: { defaultProps: { size: "md" } },
  },
});

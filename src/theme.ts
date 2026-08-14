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
});

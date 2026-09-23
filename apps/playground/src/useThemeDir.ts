import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type Dir = "ltr" | "rtl";

function readStored<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return (window.localStorage.getItem(key) as T) ?? fallback;
}

export function useThemeDir() {
  const [theme, setTheme] = useState<Theme>(() => readStored("qds-theme", "light"));
  const [dir, setDir] = useState<Dir>(() => readStored("qds-dir", "ltr"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("qds-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === "rtl" ? "ar" : "en";
    window.localStorage.setItem("qds-dir", dir);
  }, [dir]);

  return { theme, setTheme, dir, setDir };
}

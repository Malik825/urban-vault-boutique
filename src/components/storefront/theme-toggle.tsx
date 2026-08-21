import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("voltix-theme-mode") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("voltix-theme-mode", newTheme);
    window.dispatchEvent(new Event("voltix-theme-change"));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="theme-toggle"
      data-theme={theme}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {theme === "light" ? (
            <Sun className="theme-toggle__icon" />
          ) : (
            <Moon className="theme-toggle__icon" />
          )}
        </span>
      </span>
      <span className="theme-toggle__label">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </button>
  );
}

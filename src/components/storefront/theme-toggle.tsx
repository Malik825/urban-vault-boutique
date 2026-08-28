import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/** Read theme from the actual <html> class – matches the anti-flicker script */
function getActiveTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Apply a theme to the DOM and persist it */
function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("voltix-theme-mode", theme);
  window.dispatchEvent(new CustomEvent("voltix-theme-change", { detail: theme }));
}

export function ThemeToggle() {
  // Initialise from the *actual* DOM so it matches the anti-flicker script
  const [theme, setTheme] = useState<"light" | "dark">(getActiveTheme);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "voltix-theme-mode" && (e.newValue === "light" || e.newValue === "dark")) {
        applyTheme(e.newValue);
        setTheme(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = () => {
    const next: "light" | "dark" = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
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

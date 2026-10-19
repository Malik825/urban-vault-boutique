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

export function ThemeToggle({ className = "" }: { className?: string }) {
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
    <>
      {/* Mobile compact icon button (h-8 w-8) */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        className={`sm:hidden h-8 w-8 rounded-full border border-border/70 bg-muted/40 hover:bg-muted grid place-items-center text-muted-foreground hover:text-foreground active:scale-95 transition-all shrink-0 ${className}`}
      >
        {theme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-primary" />
        )}
      </button>

      {/* Desktop pill switch */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        className={`hidden sm:inline-flex theme-toggle ${className}`}
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
    </>
  );
}

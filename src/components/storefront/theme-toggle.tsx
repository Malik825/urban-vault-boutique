import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  localStorage.setItem("urban-vault-theme-mode", theme);
  localStorage.setItem("voltix-theme-mode", theme);
  window.dispatchEvent(new CustomEvent("urban-vault-theme-change", { detail: theme }));
  window.dispatchEvent(new CustomEvent("voltix-theme-change", { detail: theme }));
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">(getActiveTheme);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (
        (e.key === "urban-vault-theme-mode" || e.key === "voltix-theme-mode") &&
        (e.newValue === "light" || e.newValue === "dark")
      ) {
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
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground active:scale-95 transition-transform shrink-0 ${className}`}
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      ) : (
        <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      )}
    </Button>
  );
}

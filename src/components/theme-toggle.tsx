import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonStar, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label={isDark ? "Activate light theme" : "Activate dark theme"}
      className="relative"
    >
      <Sun className={`h-5 w-5 transition-transform ${isDark ? "scale-0" : "scale-100"}`} />
      <MoonStar
        className={`absolute h-5 w-5 transition-transform ${isDark ? "scale-100" : "scale-0"}`}
      />
    </Button>
  );
}

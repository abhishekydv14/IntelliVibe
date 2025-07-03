import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { Button } from "@/components/ui/button"

const themeOrder = ["light", "dark"];
const themeLabels = { light: "Light", dark: "Dark" };
const themeIcons = {
  light: <Sun className="h-[1.2rem] w-[1.2rem]" />,
  dark: <Moon className="h-[1.2rem] w-[1.2rem]" />,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${themeLabels[nextTheme]} mode`}
    >
      {themeIcons[theme]}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <AnimatedThemeToggler
      aria-label="Toggle theme"
      className={cn(
        "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-[18px]",
        className,
      )}
    />
  )
}

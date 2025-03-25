"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle({ inline }: { inline?: boolean }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Only show UI after mounting to prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const content = (
    <>
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </>
  )

  if (!mounted) {
    return inline ? null : (
      <Button 
        variant="ghost" 
        size="icon" 
        className="p-0 h-8 w-8 rounded-full hover:bg-muted transition-colors hover:text-foreground"
      >
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  if (inline) {
    return (
      <div onClick={toggleTheme} className="cursor-pointer">
        {content}
      </div>
    )
  }

  return (
    <Button 
      onClick={toggleTheme} 
      variant="ghost" 
      size="icon" 
      className="p-0 h-8 w-8 rounded-full hover:bg-muted transition-colors hover:text-foreground"
    >
      {content}
    </Button>
  )
} 
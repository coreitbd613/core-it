"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

import DotField from "@/components/DotField"

export function DotFieldBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <DotField
      dotRadius={2.2}
      dotSpacing={26}
      cursorRadius={220}
      bulgeStrength={24}
      glowRadius={0}
      sparkle
      gradientFrom={isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(10, 37, 64, 0.35)"}
      gradientTo={isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(10, 37, 64, 0.18)"}
    />
  )
}

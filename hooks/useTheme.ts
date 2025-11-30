import { useState, useEffect } from "react"

/**
 * テーマ（ライト/ダーク）を管理するフック
 */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // テーマをDOMに適用
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  return { theme, setTheme }
}


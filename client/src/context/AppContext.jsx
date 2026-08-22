import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LABELS } from '../constants/labels'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('hisabbook_lang') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('hisabbook_theme') || 'light')

  useEffect(() => {
    localStorage.setItem('hisabbook_lang', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('hisabbook_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const labels = LABELS[language] ?? LABELS.en

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      labels,
    }),
    [language, theme, labels],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

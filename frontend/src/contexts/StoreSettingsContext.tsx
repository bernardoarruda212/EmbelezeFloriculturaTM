import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { StoreSettings } from '../types/storeSettings'
import { storeSettingsApi } from '../api/storeSettingsApi'

interface StoreSettingsContextType {
  settings: StoreSettings | null
  isLoading: boolean
  refresh: () => Promise<void>
}

const StoreSettingsContext = createContext<StoreSettingsContextType | null>(null)

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const res = await storeSettingsApi.get()
      setSettings(res.data)
    } catch {
      // Settings not available yet
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <StoreSettingsContext.Provider value={{ settings, isLoading, refresh: fetchSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  )
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext)
  if (!context) throw new Error('useStoreSettings must be used within StoreSettingsProvider')
  return context
}

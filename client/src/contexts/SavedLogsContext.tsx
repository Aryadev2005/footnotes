import { createContext, useContext, useState, ReactNode } from 'react'

interface SavedLog {
  id: string
  friendName: string
  friendAvatar: string
  placeName: string
  area: string
  note: string
  vibe: string
  [key: string]: any
}

interface SavedLogsContextType {
  savedLogs: SavedLog[]
  toggleSave: (log: SavedLog) => void
}

const SavedLogsContext = createContext<SavedLogsContextType>({
  savedLogs: [],
  toggleSave: () => {},
})

export function SavedLogsProvider({ children }: { children: ReactNode }) {
  const [savedLogs, setSavedLogs] = useState<SavedLog[]>([])

  const toggleSave = (log: SavedLog) => {
    setSavedLogs(prev =>
      prev.find(l => l.id === log.id)
        ? prev.filter(l => l.id !== log.id)
        : [...prev, log]
    )
  }

  return (
    <SavedLogsContext.Provider value={{ savedLogs, toggleSave }}>
      {children}
    </SavedLogsContext.Provider>
  )
}

export function useSavedLogs() {
  return useContext(SavedLogsContext)
}
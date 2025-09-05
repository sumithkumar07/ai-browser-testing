import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: Date
  visitCount: number
}

interface HistoryStore {
  history: HistoryItem[]
  addHistoryItem: (url: string, title: string) => void
  removeHistoryItem: (id: string) => void
  clearHistory: () => void
  searchHistory: (query: string) => HistoryItem[]
  getHistoryByDate: (date: Date) => HistoryItem[]
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      
      addHistoryItem: (url: string, title: string) => {
        const existingItem = get().history.find(item => item.url === url)
        
        if (existingItem) {
          // Update existing item
          set(state => ({
            history: state.history.map(item =>
              item.id === existingItem.id
                ? {
                    ...item,
                    title,
                    timestamp: new Date(),
                    visitCount: item.visitCount + 1
                  }
                : item
            )
          }))
        } else {
          // Add new item
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            url,
            title: title || 'Untitled',
            timestamp: new Date(),
            visitCount: 1
          }
          
          set(state => ({
            history: [newItem, ...state.history].slice(0, 1000) // Limit to 1000 items
          }))
        }
      },
      
      removeHistoryItem: (id: string) => {
        set(state => ({
          history: state.history.filter(item => item.id !== id)
        }))
      },
      
      clearHistory: () => {
        set({ history: [] })
      },
      
      searchHistory: (query: string) => {
        const { history } = get()
        const lowerQuery = query.toLowerCase()
        
        return history.filter(item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.url.toLowerCase().includes(lowerQuery)
        )
      },
      
      getHistoryByDate: (date: Date) => {
        const { history } = get()
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const nextDate = new Date(targetDate)
        nextDate.setDate(nextDate.getDate() + 1)
        
        return history.filter(item => {
          const itemDate = new Date(item.timestamp)
          return itemDate >= targetDate && itemDate < nextDate
        })
      }
    }),
    {
      name: 'kairo-history-storage',
      partialize: (state) => ({ history: state.history })
    }
  )
)

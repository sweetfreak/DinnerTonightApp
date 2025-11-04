import {createContext, useContext, useState} from 'react'

type Section =
  | "search"
  | "friend list"
  | "chats"


  interface ActiveSectionContextType {
    activeSection: Section
    setActiveSection: (section: Section) => void
  }

  const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null)

  export function ActiveSectionProvider({children} : {children: React.ReactNode}) {
    const [activeSection, setActiveSection] = useState<Section>("friend list")

    return (
        <ActiveSectionContext.Provider value={{activeSection, setActiveSection}}>
        {children}
        </ActiveSectionContext.Provider>
    )
  }

  export default function useActiveSection() {
    const context = useContext(ActiveSectionContext)
    if (!context) throw new Error("useActiveSection must be used inside ActiveSectionProvider")
    return context
  }

  
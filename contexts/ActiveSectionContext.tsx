import {createContext, useContext, useState} from 'react'

type Section =
  | "saved"
  | "new"
  | "chats"
  | "search"
  | "myRecipes"
  | "fullRecipe"
  | "profile"
  | "editProfile"
  | "editRecipe"
  | "home"

  interface ActiveSectionContextType {
    activeSection: Section
    setActiveSection: (section: Section) => void
  }

  const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null)

  export function ActiveSectionProvider({children} : {children: React.ReactNode}) {
    const [activeSection, setActiveSection] = useState<Section>("home")

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

  
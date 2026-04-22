import { createContext, useContext, useState, ReactNode } from 'react'

export const indianCities = [
  { label: 'Bangalore', value: 'Bangalore' },
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Pune', value: 'Pune' },
  { label: 'Kolkata', value: 'Kolkata' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
]

interface LocationContextType {
  selectedCity: string
  setSelectedCity: (city: string) => void
}

const LocationContext = createContext<LocationContextType>({
  selectedCity: 'Bangalore',
  setSelectedCity: () => {},
})

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState('Bangalore')
  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation2() {
  return useContext(LocationContext)
}
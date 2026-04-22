import React from 'react'
import { Navbar } from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Desktop Sidebar Spacer - matches the w-56 in Navbar.tsx */}
        <div className="hidden shrink-0 md:block md:w-56" />
        
        <main className="flex-1 w-full relative">
          <div className="mx-auto max-w-6xl px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

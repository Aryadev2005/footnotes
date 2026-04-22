import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { SavedLogsProvider } from '@/contexts/SavedLogsContext'
import { LocationProvider } from '@/contexts/LocationContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Explore from './pages/Explore'
import Search from './pages/Search'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import Popular from './pages/Popular'
import Settings from './pages/Settings'
import FriendProfile from './pages/FriendProfile'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'
import Analytics from './pages/Analytics'
import Auth from './pages/Auth'

const App = () => (
  <LocationProvider>
    <SavedLogsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/search" element={<Search />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/friend/:username" element={<FriendProfile />} />
            <Route path="/admin" element={<Analytics />} />
            <Route path="/discover" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SavedLogsProvider>
  </LocationProvider>
)

export default App
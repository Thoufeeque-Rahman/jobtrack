import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import OpportunitiesPage from '@/pages/OpportunitiesPage'
import OpportunityDetailPage from '@/pages/OpportunityDetailPage'
import CompaniesPage from '@/pages/CompaniesPage'
import ContactsPage from '@/pages/ContactsPage'
import FollowUpsPage from '@/pages/FollowUpsPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="followups" element={<FollowUpsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { isMissingConfig } from '@/lib/supabase'
import LoginPage from '@/pages/LoginPage'
import SignUpPage from '@/pages/SignUpPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import OpportunitiesPage from '@/pages/OpportunitiesPage'
import OpportunityDetailPage from '@/pages/OpportunityDetailPage'
import CompaniesPage from '@/pages/CompaniesPage'
import ContactsPage from '@/pages/ContactsPage'
import FollowUpsPage from '@/pages/FollowUpsPage'
import SettingsPage from '@/pages/SettingsPage'
import ContentDashboardPage from '@/pages/ContentDashboardPage'
import ContentPipelinePage from '@/pages/ContentPipelinePage'
import ContentDetailPage from '@/pages/ContentDetailPage'

function MissingConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full space-y-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
          <h1 className="font-semibold text-destructive mb-2">⚠️ Supabase not configured</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Create a <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> file
            in <code className="rounded bg-muted px-1 py-0.5 text-xs">jobtrack/</code> with:
          </p>
          <pre className="rounded bg-muted p-3 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...`}
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            Then restart the dev server with <code className="rounded bg-muted px-1 py-0.5">npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  if (isMissingConfig) {
    return (
      <ThemeProvider>
        <MissingConfig />
      </ThemeProvider>
    )
  }
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Job Search */}
              <Route index element={<DashboardPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="followups" element={<FollowUpsPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Content Studio */}
              <Route path="content" element={<ContentDashboardPage />} />
              <Route path="content/pipeline" element={<ContentPipelinePage />} />
              <Route path="content/:id" element={<ContentDetailPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}

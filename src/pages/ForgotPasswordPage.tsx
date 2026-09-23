import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { BriefcaseBusiness, Loader2, Mail } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const { session, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('form')

  if (session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const err = await resetPassword(email)
    setLoading(false)

    if (err) {
      setError('Could not send reset email. Please check the address and try again.')
      return
    }

    setStep('sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BriefcaseBusiness className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">JobTrack</span>
        </div>

        {step === 'form' ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline underline-offset-4 font-medium">
                ← Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a password reset link to{' '}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm text-primary hover:underline underline-offset-4 font-medium"
            >
              ← Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}


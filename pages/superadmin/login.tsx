import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Lock, KeyRound, CheckCircle, ArrowLeft } from 'lucide-react'

type ForgotStep = 'username' | 'otp' | 'reset' | 'done'

export default function SuperAdminLogin() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState<ForgotStep>('username')
  const [fpUsername, setFpUsername] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirmPassword, setFpConfirmPassword] = useState('')
  const [fpError, setFpError] = useState('')
  const [fpSuccess, setFpSuccess] = useState('')
  const [fpSubmitting, setFpSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/superadmin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Authentication failed')
      }

      const data = await response.json()
      
      localStorage.setItem('superadminToken', data.token)
      router.push('/superadmin/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Forgot Password handlers ──
  const resetForgotFlow = () => {
    setIsForgotPassword(false)
    setForgotStep('username')
    setFpUsername('')
    setFpOtp('')
    setFpNewPassword('')
    setFpConfirmPassword('')
    setFpError('')
    setFpSuccess('')
  }

  const handleSendOtp = async () => {
    if (!fpUsername) { setFpError('Please enter the superadmin email address.'); return }
    setFpError('')
    setFpSubmitting(true)
    try {
      const res = await fetch('/api/superadmin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fpUsername }),
      })
      if (res.ok) {
        setForgotStep('otp')
        setFpSuccess('An OTP has been sent to the registered superadmin email.')
      } else {
        const data = await res.json()
        setFpError(data.message || 'Failed to send OTP. Please try again.')
      }
    } catch {
      setFpError('Network error. Please try again.')
    } finally {
      setFpSubmitting(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!fpOtp) { setFpError('Please enter the OTP.'); return }
    setFpError('')
    setFpSuccess('')
    setFpSubmitting(true)
    try {
      const res = await fetch('/api/superadmin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fpUsername, otp: fpOtp }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        setForgotStep('reset')
        setFpSuccess('')
      } else {
        setFpError(data.message || 'Invalid OTP. Please try again.')
      }
    } catch {
      setFpError('Network error. Please try again.')
    } finally {
      setFpSubmitting(false)
    }
  }

  const handleResetPassword = async () => {
    if (!fpNewPassword || !fpConfirmPassword) { setFpError('Please fill in both password fields.'); return }
    if (fpNewPassword.length < 8) { setFpError('Password must be at least 8 characters.'); return }
    if (fpNewPassword !== fpConfirmPassword) { setFpError('Passwords do not match.'); return }
    setFpError('')
    setFpSubmitting(true)
    try {
      const res = await fetch('/api/superadmin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: fpUsername, otp: fpOtp, newPassword: fpNewPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setForgotStep('done')
        setFpSuccess('Password reset successfully. You can now login with your new password.')
      } else {
        setFpError(data.message || 'Failed to reset password.')
      }
    } catch {
      setFpError('Network error. Please try again.')
    } finally {
      setFpSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={120}
              height={120}
              className="mx-auto"
            />
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-pink-600">Super Admin Access</h1>
          <p className="mt-2 text-gray-600">Restricted area. Authorized personnel only.</p>
        </div>

        <Card className="shadow-lg border-pink-100">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
            <CardTitle className="flex items-center justify-center">
              <Lock className="mr-2 h-5 w-5" />
              {isForgotPassword ? 'Reset Password' : 'Super Admin Login'}
            </CardTitle>
            <CardDescription className="text-center text-pink-700">
              {isForgotPassword ? 'Follow the steps to reset your password' : 'Enter your credentials to access the dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!isForgotPassword ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Email Address</Label>
                    <Input
                      id="username"
                      name="username"
                      type="email"
                      placeholder="Enter your email address"
                      value={credentials.username}
                      onChange={handleInputChange}
                      required
                      autoComplete="username"
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => { setIsForgotPassword(true); setError('') }}
                        className="text-sm text-pink-600 hover:text-pink-800 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
                      className="border-gray-300"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </>
            ) : (
              // ── FORGOT PASSWORD WIZARD ──
              <div className="space-y-4">
                {/* Progress Indicator */}
                {forgotStep !== 'done' && (
                  <div className="flex justify-between mb-6 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pink-100 -z-10 -translate-y-1/2" />
                    {[
                      { key: 'username', label: 'Email' },
                      { key: 'otp', label: 'OTP' },
                      { key: 'reset', label: 'New' }
                    ].map((step, idx) => {
                      const isActive = 
                        (forgotStep === 'username' && idx === 0) ||
                        (forgotStep === 'otp' && idx <= 1) ||
                        (forgotStep === 'reset' && idx <= 2)
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1 bg-white px-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            isActive ? 'bg-pink-500 text-white shadow-md' : 'bg-pink-100 text-pink-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-xs ${isActive ? 'text-pink-700 font-medium' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {fpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                    <span>{fpError}</span>
                  </div>
                )}
                {fpSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 mr-2 shrink-0" />
                    <span>{fpSuccess}</span>
                  </div>
                )}

                {/* Step 1: Email */}
                {forgotStep === 'username' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="fp-username">Superadmin Email Address</Label>
                      <Input
                        id="fp-username"
                        type="email"
                        placeholder="Enter your registered email"
                        value={fpUsername}
                        onChange={(e) => { setFpUsername(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">An OTP will be sent to the registered superadmin email.</p>
                    </div>
                    <Button onClick={handleSendOtp} disabled={fpSubmitting} className="w-full bg-pink-500 hover:bg-pink-600">
                      {fpSubmitting ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                )}

                {/* Step 2: Verify OTP */}
                {forgotStep === 'otp' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="fp-otp">Enter 6-digit OTP</Label>
                      <Input
                        id="fp-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={fpOtp}
                        onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, '')); setFpError('') }}
                        className="tracking-[0.5em] text-center text-lg font-mono border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <Button onClick={handleVerifyOtp} disabled={fpSubmitting || fpOtp.length !== 6} className="w-full bg-pink-500 hover:bg-pink-600">
                      {fpSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                    <div className="text-center">
                      <button type="button" onClick={handleSendOtp} disabled={fpSubmitting} className="text-sm text-pink-600 hover:underline">
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Reset Password */}
                {forgotStep === 'reset' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="fp-new-pw">New Password</Label>
                      <Input
                        id="fp-new-pw"
                        type="password"
                        placeholder="Must be at least 8 characters"
                        value={fpNewPassword}
                        onChange={(e) => { setFpNewPassword(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fp-confirm-pw">Confirm Password</Label>
                      <Input
                        id="fp-confirm-pw"
                        type="password"
                        placeholder="Confirm new password"
                        value={fpConfirmPassword}
                        onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400"
                      />
                    </div>
                    <Button onClick={handleResetPassword} disabled={fpSubmitting} className="w-full bg-pink-500 hover:bg-pink-600">
                      {fpSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                )}

                {/* Done */}
                {forgotStep === 'done' && (
                  <div className="text-center py-4 animate-in zoom-in duration-300">
                    <Button onClick={resetForgotFlow} className="w-full bg-pink-500 hover:bg-pink-600">
                      Return to Login
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t border-pink-100 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={resetForgotFlow}
                    className="text-sm text-gray-500 hover:text-pink-600 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
            <Link href="/" className="text-sm text-pink-600 hover:text-pink-800 transition-colors">
              Return to Home Page
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
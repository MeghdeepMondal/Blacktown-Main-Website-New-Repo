import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Upload, Globe, Image as ImageIcon, Mail, KeyRound, Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import Header from '@/components/header'
import Footer from '@/components/footer'

const validEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com']

const isValidEmailDomain = (email: string): boolean => {
  if (!email.includes('@')) return false
  const domain = email.split('@')[1]
  return validEmailDomains.includes(domain)
}

const containerStyle = { width: '100%', height: '400px' }
const center = { lat: -33.7688, lng: 150.9051 }

// ── Forgot Password Step type ──
type ForgotStep = 'email' | 'otp' | 'reset' | 'done'

const AdminAuth: React.FC = () => {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)

  // ── Forgot Password state ──
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirmPassword, setFpConfirmPassword] = useState('')
  const [fpError, setFpError] = useState('')
  const [fpSuccess, setFpSuccess] = useState('')
  const [fpSubmitting, setFpSubmitting] = useState(false)

  // ── Login / Signup text fields ──
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    description: '',
    address: '',
    contactDetails: '',
    websiteLink: '',
    lat: center.lat,
    lng: center.lng,
  })

  // File states
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [bannerPhoto, setBannerPhoto] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const profileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [markerPosition, setMarkerPosition] = useState(center)
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ── Forgot Password handlers ──
  const resetForgotFlow = () => {
    setIsForgotPassword(false)
    setForgotStep('email')
    setFpEmail('')
    setFpOtp('')
    setFpNewPassword('')
    setFpConfirmPassword('')
    setFpError('')
    setFpSuccess('')
  }

  const handleSendOtp = async () => {
    if (!fpEmail) { setFpError('Please enter your email address.'); return }
    setFpError('')
    setFpSubmitting(true)
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      })
      // Always succeeds (anti-enumeration), advance to OTP step
      if (res.ok) {
        setForgotStep('otp')
        setFpSuccess('If that email is registered, an OTP has been sent. Check your inbox.')
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
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp }),
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
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setForgotStep('done')
      } else {
        setFpError(data.message || 'Failed to reset password. Please try again.')
      }
    } catch {
      setFpError('Network error. Please try again.')
    } finally {
      setFpSubmitting(false)
    }
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      setFormData(prev => ({ ...prev, lat, lng }))
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    if (type === 'profile') {
      setProfilePhoto(file)
      setProfilePreview(previewUrl)
    } else {
      setBannerPhoto(file)
      setBannerPreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (isLogin) {
      // ── LOGIN: plain JSON to /api/admin/login ──
      setIsSubmitting(true)
      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })
        const data = await response.json()
        if (response.ok) {
          localStorage.setItem('adminToken', data.token)
          if (data.adminId) {
            router.push(`/admin/dashboard/${data.adminId}`)
          } else {
            setErrorMessage('Error: Admin ID not received. Please try again.')
          }
        } else {
          setErrorMessage(data.message || 'Authentication failed')
        }
      } catch {
        setErrorMessage('An error occurred during login. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // ── SIGNUP: multipart FormData to /api/admin/signup ──
    if (!isValidEmailDomain(formData.email)) {
      setEmailError('Please use a valid email domain.')
      return
    }

    setIsSubmitting(true)
    const fd = new FormData()
    fd.append('email', formData.email)
    fd.append('password', formData.password)
    fd.append('name', formData.name)
    fd.append('description', formData.description)
    fd.append('address', formData.address)
    fd.append('contactDetails', formData.contactDetails)
    fd.append('websiteLink', formData.websiteLink)
    fd.append('lat', String(formData.lat))
    fd.append('lng', String(formData.lng))
    if (profilePhoto) fd.append('logo', profilePhoto)
    if (bannerPhoto) fd.append('bannerPhoto', bannerPhoto)

    try {
      const response = await fetch('/api/admin/signup', {
        method: 'POST',
        body: fd, // No Content-Type header — browser sets multipart boundary
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message)
        setIsLogin(true)
      } else {
        setErrorMessage(data.message || 'Signup failed')
      }
    } catch {
      setErrorMessage('An error occurred during signup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Forgot Password step labels for progress indicator ──
  const fpSteps: { key: ForgotStep; label: string; icon: React.ReactNode }[] = [
    { key: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { key: 'otp',   label: 'Verify OTP', icon: <KeyRound className="h-4 w-4" /> },
    { key: 'reset', label: 'New Password', icon: <Lock className="h-4 w-4" /> },
  ]
  const fpStepIndex = forgotStep === 'done' ? 3 : fpSteps.findIndex(s => s.key === forgotStep)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
            <CardTitle>
              {isForgotPassword ? 'Reset Password' : isLogin ? 'Admin Login' : 'Admin Signup'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">

            {/* ══════════════════════════════════════════════
                FORGOT PASSWORD WIZARD
            ══════════════════════════════════════════════ */}
            {isForgotPassword && (
              <div className="space-y-6">

                {/* Back link */}
                {forgotStep !== 'done' && (
                  <button
                    type="button"
                    onClick={resetForgotFlow}
                    className="flex items-center gap-1 text-pink-600 hover:text-pink-800 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </button>
                )}

                {/* Progress bar */}
                {forgotStep !== 'done' && (
                  <div className="flex items-center gap-2">
                    {fpSteps.map((s, i) => (
                      <React.Fragment key={s.key}>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          i < fpStepIndex
                            ? 'bg-pink-500 text-white'
                            : i === fpStepIndex
                            ? 'bg-pink-200 text-pink-800 ring-2 ring-pink-400'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {s.icon}
                          {s.label}
                        </div>
                        {i < fpSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 rounded ${i < fpStepIndex ? 'bg-pink-400' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Error / Success banners */}
                {fpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {fpError}
                  </div>
                )}
                {fpSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {fpSuccess}
                  </div>
                )}

                {/* ── Step 1: Email ── */}
                {forgotStep === 'email' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enter your registered email address and we&apos;ll send you a 6-digit OTP to reset your password.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="fp-email" className="text-pink-800">Email Address</Label>
                      <Input
                        id="fp-email"
                        type="email"
                        placeholder="your@email.com"
                        value={fpEmail}
                        onChange={(e) => { setFpEmail(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        disabled={fpSubmitting}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={fpSubmitting}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all"
                    >
                      {fpSubmitting ? 'Sending OTP…' : 'Send OTP'}
                    </Button>
                  </div>
                )}

                {/* ── Step 2: Verify OTP ── */}
                {forgotStep === 'otp' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      A 6-digit OTP was sent to <strong className="text-pink-700">{fpEmail}</strong>. It expires in 10 minutes.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="fp-otp" className="text-pink-800">One-Time Password (OTP)</Label>
                      <Input
                        id="fp-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        value={fpOtp}
                        onChange={(e) => { setFpOtp(e.target.value.replace(/\D/g, '')); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 tracking-[0.4em] text-center font-mono text-xl"
                        disabled={fpSubmitting}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={fpSubmitting || fpOtp.length !== 6}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all"
                    >
                      {fpSubmitting ? 'Verifying…' : 'Verify OTP'}
                    </Button>
                    <button
                      type="button"
                      className="text-xs text-pink-500 hover:text-pink-700 underline w-full text-center transition-colors"
                      onClick={() => { setFpOtp(''); setFpError(''); setFpSuccess(''); handleSendOtp() }}
                      disabled={fpSubmitting}
                    >
                      Didn&apos;t receive the OTP? Resend
                    </button>
                  </div>
                )}

                {/* ── Step 3: New Password ── */}
                {forgotStep === 'reset' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Choose a strong new password (minimum 8 characters).</p>
                    <div className="space-y-2">
                      <Label htmlFor="fp-new-password" className="text-pink-800">New Password</Label>
                      <Input
                        id="fp-new-password"
                        type="password"
                        placeholder="New password"
                        value={fpNewPassword}
                        onChange={(e) => { setFpNewPassword(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        disabled={fpSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fp-confirm-password" className="text-pink-800">Confirm New Password</Label>
                      <Input
                        id="fp-confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        value={fpConfirmPassword}
                        onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError('') }}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        disabled={fpSubmitting}
                      />
                    </div>
                    {fpNewPassword && fpConfirmPassword && fpNewPassword !== fpConfirmPassword && (
                      <p className="text-red-500 text-xs">Passwords do not match.</p>
                    )}
                    <Button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={fpSubmitting || !fpNewPassword || !fpConfirmPassword}
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all"
                    >
                      {fpSubmitting ? 'Saving…' : 'Save New Password'}
                    </Button>
                  </div>
                )}

                {/* ── Step 4: Success ── */}
                {forgotStep === 'done' && (
                  <div className="text-center space-y-4 py-4">
                    <div className="flex justify-center">
                      <div className="bg-green-100 rounded-full p-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Password Reset Successful!</h3>
                    <p className="text-sm text-gray-600">Your password has been updated. You can now log in with your new password.</p>
                    <Button
                      type="button"
                      onClick={resetForgotFlow}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all px-8"
                    >
                      Back to Login
                    </Button>
                  </div>
                )}

              </div>
            )}

            {/* ══════════════════════════════════════════════
                LOGIN / SIGNUP FORM (hidden when forgot pw)
            ══════════════════════════════════════════════ */}
            {!isForgotPassword && (
            <>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Email ── */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-pink-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => { handleInputChange(e); setEmailError('') }}
                  onBlur={(e) => {
                    if (!isLogin && e.target.value && !isValidEmailDomain(e.target.value)) {
                      setEmailError('Please use a valid email domain.')
                    }
                  }}
                  required
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              {/* ── Password ── */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-pink-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>

              {/* ── Signup-only fields ── */}
              {!isLogin && (
                <>
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-pink-800">Name</Label>
                    <Input
                      id="name"
                      placeholder="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-pink-800">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  {/* ── Profile Photo ── */}
                  <div className="space-y-2">
                    <Label className="text-pink-800">Profile Photo</Label>
                    <div className="flex items-center gap-4">
                      {/* Circular preview */}
                      <div
                        onClick={() => profileInputRef.current?.click()}
                        className="relative w-20 h-20 rounded-full border-2 border-dashed border-pink-300 bg-pink-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-pink-500 transition-colors flex-shrink-0"
                      >
                        {profilePreview ? (
                          <Image
                            src={profilePreview}
                            alt="Profile preview"
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-pink-400">
                            <Upload className="h-6 w-6" />
                            <span className="text-xs mt-1">Photo</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <p className="font-medium text-pink-800">Upload a profile photo</p>
                        <p>JPG, PNG, WEBP up to 10 MB</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => profileInputRef.current?.click()}
                          className="mt-1 border-pink-300 text-pink-700 hover:bg-pink-50"
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'profile')}
                    />
                  </div>

                  {/* ── Banner Photo ── */}
                  <div className="space-y-2">
                    <Label className="text-pink-800">Banner / Cover Photo</Label>
                    <div
                      onClick={() => bannerInputRef.current?.click()}
                      className="relative w-full h-36 border-2 border-dashed border-pink-300 bg-pink-50 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-pink-500 transition-colors"
                    >
                      {bannerPreview ? (
                        <Image
                          src={bannerPreview}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-pink-400">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-sm mt-2 font-medium">Click to upload banner photo</span>
                          <span className="text-xs text-gray-400">Recommended: 1200 × 400 px</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 'banner')}
                    />
                  </div>

                  {/* Map */}
                  {isLoaded && (
                    <div className="space-y-2">
                      <Label className="text-pink-800">Location</Label>
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        onClick={handleMapClick}
                      >
                        <Marker position={markerPosition} />
                      </GoogleMap>
                    </div>
                  )}

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-pink-800">Address</Label>
                    <Input
                      id="address"
                      placeholder="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-2">
                    <Label htmlFor="contactDetails" className="text-pink-800">Contact Details</Label>
                    <Input
                      id="contactDetails"
                      placeholder="Contact Details"
                      name="contactDetails"
                      value={formData.contactDetails}
                      onChange={handleInputChange}
                      required
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>

                  {/* Website Link */}
                  <div className="space-y-2">
                    <Label htmlFor="websiteLink" className="text-pink-800">
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Organisation Website Link
                      </span>
                    </Label>
                    <Input
                      id="websiteLink"
                      type="url"
                      placeholder="https://www.yourorganisation.com"
                      name="websiteLink"
                      value={formData.websiteLink}
                      onChange={handleInputChange}
                      className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : isLogin ? 'Login' : 'Signup'}
              </Button>
            </form>

            {/* Forgot Password link — only visible on login tab */}
            {isLogin && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setErrorMessage(''); setFpError('') }}
                  className="text-sm text-pink-500 hover:text-pink-700 underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <p className="mt-4 text-center text-pink-800">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrorMessage('')
                  setEmailError('')
                }}
                className="text-pink-600 hover:text-pink-700"
                disabled={isSubmitting}
              >
                {isLogin ? 'Signup' : 'Login'}
              </Button>
            </p>
            </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default AdminAuth
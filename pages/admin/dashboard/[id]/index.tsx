import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Calendar, Trash2, MapPin, LogOut, Edit, Camera,
  Globe, Phone, Mail, User, Building2, ExternalLink, Loader2
} from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import RichTextEditor from '@/components/rich-text-editor'

const containerStyle = { width: '100%', height: '300px' }
const center = { lat: -33.7688, lng: 150.9051 }

interface AdminData {
  id: string
  name: string
  email: string
  description?: string
  address?: string
  contactDetails?: string
  logo?: string
  bannerPhoto?: string
  websiteLink?: string
  lat?: number
  lng?: number
}

interface EventData {
  id: string
  name: string
  date: string
  frequency: string
  location: string
  description: string
  lat: number
  lng: number
  photo?: string
  registrationLink?: string
  hasOpportunity?: boolean
  opportunity?: string
}

const AdminDashboard: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [newEvent, setNewEvent] = useState<EventData>({
    id: '', name: '', date: '', frequency: '', location: '',
    description: '', lat: center.lat, lng: center.lng,
    registrationLink: '', hasOpportunity: false, opportunity: ''
  })
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [markerPosition, setMarkerPosition] = useState(center)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAdmin, setIsEditingAdmin] = useState(false)
  const [editedAdminData, setEditedAdminData] = useState<AdminData | null>(null)
  const [emailError, setEmailError] = useState('')
  const [eventPhoto, setEventPhoto] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'events'>('profile')
  const [photoUploading, setPhotoUploading] = useState<'logo' | 'banner' | null>(null)
  const [photoError, setPhotoError] = useState('')

  const profileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const uploadPhoto = async (file: File, type: 'logo' | 'bannerPhoto') => {
    if (!id) return
    setPhotoUploading(type === 'logo' ? 'logo' : 'banner')
    setPhotoError('')
    const fd = new FormData()
    fd.append(type, file)
    try {
      const res = await fetch(`/api/admin/${id}/photos`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).message || 'Upload failed')
      const updated = await res.json()
      setAdminData(updated)
      setEditedAdminData(updated)
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Photo upload failed')
    } finally {
      setPhotoUploading(null)
    }
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  useEffect(() => {
    const fetchAdminData = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/admin/${id}`)
          if (!response.ok) throw new Error('Failed to fetch admin data')
          const data = await response.json()
          setAdminData(data.admin)
          setEditedAdminData(data.admin)
          setEvents(data.events)
        } catch (error) {
          console.error('Error fetching admin data:', error)
          setError('Failed to load admin data. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchAdminData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setNewEvent(prev => ({ ...prev, hasOpportunity: checked }))
  }

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedAdminData(prev => ({ ...prev!, [name]: value }))
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      setNewEvent(prev => ({ ...prev, lat, lng }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', newEvent.name)
      formData.append('date', newEvent.date)
      formData.append('frequency', newEvent.frequency)
      formData.append('location', newEvent.location)
      formData.append('description', newEvent.description)
      formData.append('lat', newEvent.lat.toString())
      formData.append('lng', newEvent.lng.toString())
      formData.append('adminId', id as string)
      formData.append('registrationLink', newEvent.registrationLink || '')
      formData.append('hasOpportunity', newEvent.hasOpportunity ? 'true' : 'false')
      if (newEvent.hasOpportunity) formData.append('opportunity', newEvent.opportunity || '')
      if (eventPhoto) formData.append('photo', eventPhoto)

      const url = isEditing ? `/api/admin/events/${newEvent.id}` : '/api/events'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, { method, body: formData })
      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'add'} event`)

      const eventData = await response.json()
      if (isEditing) {
        setEvents(prev => prev.map(ev => ev.id === eventData.id ? eventData : ev))
      } else {
        setEvents(prev => [...prev, eventData])
      }
      resetForm()
      setActiveTab('events')
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} event:`, error)
      setError(`Failed to ${isEditing ? 'update' : 'add'} event. Please try again.`)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete event')
      setEvents(prev => prev.filter(ev => ev.id !== eventId))
      if (expandedEventId === eventId) setExpandedEventId(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/auth')
  }

  const handleEditEvent = (event: EventData) => {
    setNewEvent(event)
    setMarkerPosition({ lat: event.lat, lng: event.lng })
    setIsEditing(true)
    setActiveTab('events')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setNewEvent({
      id: '', name: '', date: '', frequency: '', location: '',
      description: '', lat: center.lat, lng: center.lng,
      registrationLink: '', hasOpportunity: false, opportunity: ''
    })
    setMarkerPosition(center)
    setIsEditing(false)
    setEventPhoto(null)
  }

  const handleSubmitAdminEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedAdminData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400 && errorData.message.includes('Email already in use')) {
          setEmailError(errorData.message)
          return
        }
        throw new Error('Failed to update admin information')
      }
      const updatedAdmin = await response.json()
      setAdminData(updatedAdmin)
      setIsEditingAdmin(false)
    } catch (error) {
      console.error('Error updating admin information:', error)
      setError('Failed to update admin information. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-pink-700 font-medium">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">No admin data found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Top Nav ── */}
      <header className="bg-black text-white shadow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/One Heart.png" alt="One Heart Blacktown" width={48} height={48} className="object-contain" />
            <span className="text-xl font-bold">One Heart Blacktown</span>
          </div>
          <nav>
            <ul className="flex items-center space-x-5 text-sm font-medium">
              {[['/', 'Home'], ['/members', 'Members'], ['/blog', 'Blog'], ['/opportunities', 'Opportunities'], ['/events', 'Events'], ['/about', 'About'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-white hover:text-pink-400 transition-colors duration-200">{label}</Link>
                </li>
              ))}
              <li>
                <Button variant="ghost" size="sm" onClick={handleLogout}
                  className="text-white hover:text-pink-400 hover:bg-transparent transition-colors duration-200">
                  <LogOut className="mr-1.5 h-4 w-4" />Logout
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>


      {/* ── Hero Banner + Profile ── */}
      <div className="relative">

        {/* ── Banner ── */}
        <div className="relative h-56 md:h-72 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 overflow-hidden">
          {adminData.bannerPhoto ? (
            <Image src={adminData.bannerPhoto} alt="Organisation banner" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Banner upload overlay — centered, always visible on hover */}
          <label
            className="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity duration-200 cursor-pointer z-10"
          >
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white font-semibold shadow-lg backdrop-blur-md border border-white/30 hover:bg-white/30 transition-colors">
              {photoUploading === 'banner' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              {photoUploading === 'banner' ? 'Uploading…' : 'Change Banner'}
            </div>
            {/* Native file input inside label */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={photoUploading !== null}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadPhoto(file, 'bannerPhoto')
                e.target.value = ''
              }}
            />
          </label>
        </div>

        {/* ── Profile photo overlapping the banner ── */}
        <div className="container mx-auto px-6">
          <div className="relative -mt-16 flex items-end gap-6 pb-4 z-20">

            {/* Profile photo circle with camera overlay */}
            <div className="relative flex-shrink-0 group/avatar">
              <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl bg-pink-100 overflow-hidden">
                {adminData.logo ? (
                  <Image src={adminData.logo} alt={adminData.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-14 h-14 text-pink-300" />
                  </div>
                )}
              </div>

              {/* Camera overlay label */}
              <label
                className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/40 transition-opacity duration-200 cursor-pointer ${photoUploading === 'logo' ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  }`}
              >
                {photoUploading === 'logo' ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                {/* Native file input inside label */}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadPhoto(file, 'logo')
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            <div className="mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{adminData.name}</h1>
              {adminData.websiteLink && (
                <a
                  href={adminData.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 hover:underline mt-0.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {adminData.websiteLink.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-6 pb-16 mt-2">

        {(error || photoError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
            {error || photoError}
          </div>
        )}


        {/* ── Tab Bar ── */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8 w-fit">
          {(['profile', 'events'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${activeTab === tab
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-pink-600 hover:bg-pink-50'
                }`}
            >
              {tab === 'profile' ? 'Organisation Profile' : `Events (${events.length})`}
            </button>
          ))}
        </div>

        {/* ═══════════════ PROFILE TAB ═══════════════ */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 gap-6">

            {/* Full-width info display / edit */}
            <div>
              <Card className="shadow-md border border-gray-100 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold">Organisation Information</CardTitle>
                  {!isEditingAdmin && (
                    <Button onClick={() => setIsEditingAdmin(true)} variant="secondary" size="sm"
                      className="text-pink-700 bg-white hover:bg-pink-50 border border-pink-200 h-8 text-xs">
                      <Edit className="w-3.5 h-3.5 mr-1" />Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-6">
                  {isEditingAdmin ? (
                    <form onSubmit={handleSubmitAdminEdit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</Label>
                          <Input id="name" name="name" value={editedAdminData?.name} onChange={handleAdminInputChange} required className="border-pink-200 focus:ring-pink-400" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</Label>
                          <Input id="email" name="email" type="email" value={editedAdminData?.email} onChange={handleAdminInputChange} required className="border-pink-200 focus:ring-pink-400" />
                          {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
                        <textarea
                          id="description" name="description" rows={3}
                          value={editedAdminData?.description || ''}
                          onChange={handleAdminInputChange}
                          className="w-full px-3 py-2 border border-pink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="address" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</Label>
                        <Input id="address" name="address" value={editedAdminData?.address || ''} onChange={handleAdminInputChange} className="border-pink-200 focus:ring-pink-400" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="contactDetails" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Details</Label>
                          <Input id="contactDetails" name="contactDetails" value={editedAdminData?.contactDetails || ''} onChange={handleAdminInputChange} className="border-pink-200 focus:ring-pink-400" />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="websiteLink" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website Link</Label>
                          <Input id="websiteLink" name="websiteLink" type="url" placeholder="https://yoursite.com" value={editedAdminData?.websiteLink || ''} onChange={handleAdminInputChange} className="border-pink-200 focus:ring-pink-400" />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white text-sm h-9">Save Changes</Button>
                        <Button type="button" variant="outline" onClick={() => { setIsEditingAdmin(false); setEditedAdminData(adminData) }} className="border-pink-300 text-pink-600 hover:bg-pink-50 text-sm h-9">Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                      <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={adminData.name} />
                      <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={adminData.email} />
                      {adminData.description && (
                        <div className="sm:col-span-2">
                          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Description" value={adminData.description} />
                        </div>
                      )}
                      {adminData.address && (
                        <div className="sm:col-span-2">
                          <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={adminData.address} />
                        </div>
                      )}
                      {adminData.contactDetails && (
                        <InfoRow icon={<Phone className="w-4 h-4" />} label="Contact" value={adminData.contactDetails} />
                      )}
                      {adminData.websiteLink && (
                        <div>
                          <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            <Globe className="w-4 h-4" />Website
                          </dt>
                          <dd>
                            <a href={adminData.websiteLink} target="_blank" rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 hover:underline text-sm flex items-center gap-1">
                              {adminData.websiteLink.replace(/^https?:\/\//, '')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════ EVENTS TAB ═══════════════ */}
        {activeTab === 'events' && (
          <div className="space-y-8">

            {/* ── Add / Edit Event Form ── */}
            <Card className="shadow-md border border-gray-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {isEditing ? 'Edit Event' : 'Add New Event'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Name</Label>
                      <Input id="name" placeholder="Event Name" name="name" value={newEvent.name} onChange={handleInputChange} required className="border-pink-200 focus:ring-pink-400" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</Label>
                      <Input id="date" type="date" name="date" value={newEvent.date} onChange={handleInputChange} required className="border-pink-200 focus:ring-pink-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="frequency" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</Label>
                      <select id="frequency" name="frequency" value={newEvent.frequency} onChange={handleInputChange} required
                        className="w-full px-3 py-2 border border-pink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white">
                        <option value="">Select Frequency</option>
                        <option value="Once Off">Once Off</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="location" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</Label>
                      <Input id="location" placeholder="Location" name="location" value={newEvent.location} onChange={handleInputChange} required className="border-pink-200 focus:ring-pink-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
                    <RichTextEditor value={newEvent.description} onChange={(value) => setNewEvent(prev => ({ ...prev, description: value }))} placeholder="Describe your event…" minHeight="180px" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="registrationLink" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration Link</Label>
                      <Input id="registrationLink" placeholder="https://forms.gle/..." name="registrationLink" value={newEvent.registrationLink} onChange={handleInputChange} className="border-pink-200 focus:ring-pink-400" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="photo" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Photo</Label>
                      <Input id="photo" type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setEventPhoto(e.target.files[0]) }} className="border-pink-200 focus:ring-pink-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-pink-100 file:text-pink-700" />
                    </div>
                  </div>

                  {/* Volunteer Opportunity */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                    <Switch id="hasOpportunity" checked={newEvent.hasOpportunity} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="hasOpportunity" className="font-medium text-sm">Add Volunteer Opportunity</Label>
                  </div>
                  {newEvent.hasOpportunity && (
                    <div className="space-y-2 pl-4 border-l-2 border-pink-200">
                      <Label htmlFor="opportunity" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opportunity Description</Label>
                      <RichTextEditor value={newEvent.opportunity || ''} onChange={(value) => setNewEvent(prev => ({ ...prev, opportunity: value }))} placeholder="Describe the volunteer opportunity…" minHeight="140px" />
                      <p className="text-xs text-gray-400">This will be shown on the Opportunities page.</p>
                    </div>
                  )}

                  {/* Map */}
                  {isLoaded && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Location (Click to set)</Label>
                      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}
                        onClick={(e) => {
                          if (e.latLng) {
                            const lat = e.latLng.lat(); const lng = e.latLng.lng()
                            setMarkerPosition({ lat, lng }); setNewEvent(prev => ({ ...prev, lat, lng }))
                          }
                        }}>
                        <Marker position={markerPosition} />
                      </GoogleMap>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-sm">
                      {isEditing ? 'Update Event' : 'Add Event'}
                    </Button>
                    {isEditing && (
                      <Button type="button" variant="outline" onClick={resetForm} className="border-pink-300 text-pink-600 hover:bg-pink-50">Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* ── Events Grid ── */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Events</h2>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {events.map((event) => (
                    <Card key={event.id} className="bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 rounded-2xl overflow-hidden group">
                      {event.photo && (
                        <div className="relative h-44 w-full">
                          <Image src={event.photo} alt={event.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      )}
                      <CardHeader className={`${event.photo ? 'pt-3' : 'pt-4'} px-4 pb-2`}>
                        <CardTitle className="text-base font-semibold text-gray-800 line-clamp-1">{event.name}</CardTitle>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <div className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: event.description }} />
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                            {event.frequency}
                          </span>
                          {event.hasOpportunity && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Volunteer Opportunity
                            </span>
                          )}
                        </div>
                        {event.registrationLink && (
                          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-pink-600 hover:underline">
                            <ExternalLink className="w-3 h-3" />Register
                          </a>
                        )}
                        <div className="flex gap-2 pt-1 border-t border-gray-100">
                          <Button size="sm" onClick={() => handleEditEvent(event)} className="flex-1 bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 shadow-none text-xs h-8">
                            <Edit className="w-3 h-3 mr-1" />Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)} className="flex-1 text-xs h-8">
                            <Trash2 className="w-3 h-3 mr-1" />Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-pink-200">
                  <Calendar className="w-12 h-12 text-pink-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No events yet</p>
                  <p className="text-gray-400 text-sm">Use the form above to create your first event.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          © 2025 One Heart Blacktown. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// ── Helper sub-component ──
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        {icon}{label}
      </dt>
      <dd className="text-sm text-gray-800">{value}</dd>
    </div>
  )
}

export default AdminDashboard
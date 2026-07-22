'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { MapPin, Calendar, Search, Filter, ExternalLink, Building2, Map as MapIcon, List as ListIcon, Compass, RefreshCw, AlertCircle } from 'lucide-react'
import Layout from '@/components/Layout'

// Types
interface Admin {
  id: string
  name: string
}

interface Event {
  id: string
  name: string
  description: string
  date: string
  location: string
  lat: number
  lng: number
  photo?: string
  frequency: string
  registrationLink?: string
  adminId: string
  admin?: Admin
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: -33.7688,
  lng: 150.9051
}

const stripHtmlTags = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

const EventsPage: React.FC = () => {
  const router = useRouter()
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [hasLocation, setHasLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [orgFilter, setOrgFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('any')
  const [sortBy, setSortBy] = useState('date')
  const [isNearbyMode, setIsNearbyMode] = useState(false)
  const [radius, setRadius] = useState([5]) // in kilometers
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list')
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })



  // Geolocation request handler
  const requestUserLocation = () => {
    if (hasLocation) return

    setLocationLoading(true)
    setLocationError(null)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setHasLocation(true)
          setLocationLoading(false)
        },
        (err) => {
          console.error('Error getting location:', err)
          setLocationError('Failed to access your location. Using default location and showing all events.')
          setLocationLoading(false)
          setIsNearbyMode(false) // Toggle off Nearby Mode if GPS fails
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      setIsNearbyMode(false)
    }
  }

  // Handle Nearby Mode switch toggle
  const handleNearbyToggle = (checked: boolean) => {
    setIsNearbyMode(checked)
    if (checked) {
      requestUserLocation()
    }
  }

  // Handle Sort selection changes
  const handleSortChange = (value: string) => {
    setSortBy(value)
    if (value === 'distance') {
      requestUserLocation()
    }
  }

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=1000')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        if (Array.isArray(data.events)) {
          setEvents(data.events)
        } else {
          throw new Error('Received invalid data format for events')
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load events. Please try again later.')
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Extract unique organizations for filter dropdown
  useEffect(() => {
    if (events.length > 0) {
      const orgsMap = new Map<string, string>()
      events.forEach(event => {
        if (event.admin && event.admin.id && event.admin.name) {
          orgsMap.set(event.admin.id, event.admin.name)
        }
      })
      const uniqueOrgs = Array.from(orgsMap.entries()).map(([id, name]) => ({
        id,
        name
      }))
      setOrganizations(uniqueOrgs)
    }
  }, [events])

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Filter and sort events
  useEffect(() => {
    let filtered = [...events]

    // 1. Filter by Search Term
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        (event.admin && event.admin.name.toLowerCase().includes(query))
      )
    }

    // 2. Filter by Organization
    if (orgFilter && orgFilter !== 'all') {
      filtered = filtered.filter(event => event.adminId === orgFilter)
    }

    // 3. Filter by Date
    if (dateFilter && dateFilter !== 'any') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const oneMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        
        switch(dateFilter) {
          case 'today':
            return eventDate.toDateString() === today.toDateString()
          case 'week':
            return eventDate >= today && eventDate <= oneWeek
          case 'month':
            return eventDate >= today && eventDate <= oneMonth
          case 'upcoming':
            return eventDate >= today
          case 'past':
            return eventDate < today
          default:
            return true
        }
      })
    }

    // 4. Filter by Radius (Only when Nearby Mode is active and location is available)
    if (isNearbyMode && hasLocation) {
      filtered = filtered.filter(event => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          event.lat,
          event.lng
        )
        return distance <= radius[0]
      })
    }

    // 5. Apply Sorting
    if (sortBy === 'distance' && hasLocation) {
      filtered.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
        return distA - distB
      })
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else {
      // Default: sort by date (soonest first)
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, orgFilter, dateFilter, sortBy, isNearbyMode, hasLocation, userLocation, radius])

  const resetFilters = () => {
    setSearchTerm('')
    setOrgFilter('all')
    setDateFilter('any')
    setSortBy('date')
    setIsNearbyMode(false)
    setLocationError(null)
  }

  const renderSkeletons = () => (
    <div className={
      viewMode === 'split' 
        ? "space-y-6" 
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }>
      {[1, 2, 3].map((n) => (
        <Card key={n} className="bg-white shadow-md animate-pulse overflow-hidden">
          <div className="h-48 bg-pink-100/50" />
          <CardContent className="p-4">
            <div className="h-6 bg-pink-100/50 rounded w-2/3 mb-4" />
            <div className="h-4 bg-pink-100/30 rounded w-5/6 mb-2" />
            <div className="h-4 bg-pink-100/30 rounded w-4/5 mb-4" />
            <div className="h-4 bg-pink-100/20 rounded w-1/2 mb-6" />
            <div className="space-y-2 mt-4">
              <div className="h-10 bg-pink-200/50 rounded w-full" />
              <div className="h-10 bg-pink-100/30 rounded w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderEmptyState = () => (
    <div className="text-center py-16 bg-white rounded-lg shadow border border-pink-100 w-full col-span-full">
      <Building2 className="h-16 w-16 mx-auto text-pink-300 mb-4" />
      <h3 className="text-xl font-semibold text-pink-800 mb-2">No events found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search query, selecting a different date/organization, or expanding the search radius.</p>
      <Button onClick={resetFilters} className="bg-pink-500 hover:bg-pink-600 text-white">Reset All Filters</Button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Layout>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-pink-800 mb-2">Community Events</h1>
            <p className="text-lg text-pink-700 max-w-2xl mx-auto">
              Find and join events near you organized by local churches and outreach groups in the Blacktown area.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-pink-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Search Input */}
              <div className="w-full">
                <Label htmlFor="search" className="mb-2 text-pink-800 font-medium flex items-center">
                  <Search className="w-4 h-4 mr-1 text-pink-500" /> Search Events
                </Label>
                <Input
                  id="search"
                  placeholder="Search by keyword..."
                  className="focus-visible:ring-pink-500 border-pink-100"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Organization Dropdown */}
              <div className="w-full">
                <Label htmlFor="organization" className="mb-2 text-pink-800 font-medium flex items-center">
                  <Building2 className="w-4 h-4 mr-1 text-pink-500" /> Organization
                </Label>
                <Select value={orgFilter} onValueChange={setOrgFilter}>
                  <SelectTrigger id="organization" className="focus:ring-pink-500 border-pink-100">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Dropdown */}
              <div className="w-full">
                <Label htmlFor="date" className="mb-2 text-pink-800 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-pink-500" /> Date
                </Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date" className="focus:ring-pink-500 border-pink-100">
                    <SelectValue placeholder="Any Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Date</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="upcoming">All Upcoming</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Dropdown */}
              <div className="w-full">
                <Label htmlFor="sort" className="mb-2 text-pink-800 font-medium flex items-center">
                  <Filter className="w-4 h-4 mr-1 text-pink-500" /> Sort By
                </Label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger id="sort" className="focus:ring-pink-500 border-pink-100">
                    <SelectValue placeholder="Date (Soonest)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Soonest)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem 
                      value="distance" 
                      disabled={!hasLocation && (typeof navigator === 'undefined' || !navigator.geolocation)}
                    >
                      Distance (Nearest) {!hasLocation && "(Requires GPS)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-4">
              {/* Location mode settings */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-pink-50/50 px-4 py-3 rounded-lg border border-pink-100/60 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Switch
                    id="nearby-mode"
                    checked={isNearbyMode}
                    onCheckedChange={handleNearbyToggle}
                    className="data-[state=checked]:bg-pink-500"
                  />
                  <Label htmlFor="nearby-mode" className="font-semibold text-pink-800 flex items-center gap-1.5 cursor-pointer">
                    <Compass className="w-4 h-4 text-pink-500" />
                    Nearby Mode
                  </Label>
                </div>

                {isNearbyMode && (
                  <div className="flex items-center gap-4 w-full sm:w-80 ml-0 sm:ml-4">
                    <span className="text-sm font-medium text-pink-700 whitespace-nowrap min-w-[110px] shrink-0">Radius: {radius[0]}km</span>
                    <Slider
                      defaultValue={[5]}
                      max={50}
                      min={1}
                      step={1}
                      value={radius}
                      onValueChange={setRadius}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Reset Filters button */}
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 w-full sm:w-auto"
              >
                Reset Filters
              </Button>
            </div>

            {/* Location permission error banner */}
            {locationError && (
              <div className="mt-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{locationError}</span>
                <button 
                  onClick={() => setLocationError(null)} 
                  className="ml-auto text-rose-500 hover:text-rose-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Geolocation loading state */}
            {locationLoading && (
              <div className="mt-4 flex items-center gap-2 text-pink-600 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Requesting your location...</span>
              </div>
            )}
          </div>

          {/* Results Summary and View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-pink-700 font-medium">
              {!loading && `${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'} found`}
            </p>
            
            <div className="flex bg-white rounded-lg border border-pink-100 p-1 shadow-sm shrink-0">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-pink-500 text-white shadow-sm' : 'text-pink-600 hover:bg-pink-50'}`}
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">List View</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-pink-500 text-white shadow-sm' : 'text-pink-600 hover:bg-pink-50'}`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map View</span>
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex px-3 py-1.5 rounded-md text-sm font-medium transition-all items-center gap-1.5 ${viewMode === 'split' ? 'bg-pink-500 text-white shadow-sm' : 'text-pink-600 hover:bg-pink-50'}`}
              >
                <Compass className="w-4 h-4" />
                Split View
              </button>
            </div>
          </div>

          {/* Main Grid View */}
          {error && events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow text-rose-500 border border-rose-100">
              <AlertCircle className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error loading events</h3>
              <p>{error}</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${
              viewMode === 'split' 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {/* Event Cards section */}
              <div className={`${
                viewMode === 'map' 
                  ? 'hidden' 
                  : viewMode === 'split' 
                    ? 'space-y-6 max-h-[800px] overflow-y-auto pr-2' 
                    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }`}>
                {loading ? (
                  renderSkeletons()
                ) : filteredEvents.length === 0 ? (
                  renderEmptyState()
                ) : (
                  filteredEvents.map((event) => (
                    <Card key={event.id} className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-pink-100/60 ${viewMode === 'split' ? 'h-auto' : 'h-full'}`}>
                      <CardHeader className="p-0 relative flex-shrink-0">
                        <div className="relative h-48 w-full bg-pink-50">
                          <Image
                            src={event.photo || "/placeholder.svg?height=400&width=600"}
                            alt={event.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {hasLocation && (
                          <div className="absolute top-3 left-3 bg-pink-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1 backdrop-blur-sm">
                            <MapPin className="w-3.5 h-3.5" />
                            {calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng).toFixed(1)} km away
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-5 flex flex-col flex-grow">
                        <h3 className="text-xl font-semibold mb-2 text-pink-900 line-clamp-1">{event.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-grow">{stripHtmlTags(event.description)}</p>
                        
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-pink-400 shrink-0" />
                            <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-pink-400 shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          {event.admin && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-pink-400 shrink-0" />
                              <span className="line-clamp-1 font-medium text-pink-700/80">{event.admin.name}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-auto pt-4 flex flex-col gap-2 border-t border-gray-100">
                          <Link href={`/events/${event.id}`} passHref className="w-full">
                            <Button
                              variant="default"
                              className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-colors"
                            >
                              Read More
                            </Button>
                          </Link>
                          {event.registrationLink && (
                            <Button
                              variant="outline"
                              className="w-full border-pink-500 text-pink-500 hover:bg-pink-50 transition-colors"
                              onClick={() => window.open(event.registrationLink, '_blank')}
                            >
                              Register
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Map section */}
              <div className={`${
                viewMode === 'list' 
                  ? 'hidden' 
                  : viewMode === 'split' 
                    ? 'h-[600px] lg:h-[800px] rounded-lg overflow-hidden border border-pink-200 shadow-md' 
                    : 'h-[600px] lg:h-[800px] rounded-lg overflow-hidden border border-pink-200 shadow-md w-full'
              }`}>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={userLocation}
                    zoom={12}
                  >
                    {/* User location marker */}
                    {hasLocation && (
                      <Marker
                        position={userLocation}
                        icon={{
                          url: '/user-location.png',
                          scaledSize: new window.google.maps.Size(30, 30),
                        }}
                      />
                    )}

                    {/* Event markers */}
                    {filteredEvents.map((event) => (
                      <Marker
                        key={event.id}
                        position={{ lat: event.lat, lng: event.lng }}
                        title={event.name}
                        onClick={() => router.push(`/events/${event.id}`)}
                      />
                    ))}

                    {/* Radius circle */}
                    {hasLocation && isNearbyMode && (
                      <Circle
                        center={userLocation}
                        radius={radius[0] * 1000} // Convert km to meters
                        options={{
                          fillColor: '#f472b6',
                          fillOpacity: 0.1,
                          strokeColor: '#db2777',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                        }}
                      />
                    )}
                  </GoogleMap>
                ) : (
                  <div className="flex items-center justify-center h-full bg-pink-50/50 text-pink-600">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading interactive map...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </Layout>
    </div>
  )
}

// Google Maps Circle component
const Circle: React.FC<{
  center: google.maps.LatLngLiteral;
  radius: number;
  options: google.maps.CircleOptions;
}> = ({ center, radius, options }) => {
  const [circle, setCircle] = useState<google.maps.Circle>()

  useEffect(() => {
    if (!circle) {
      setCircle(new google.maps.Circle())
    }

    return () => {
      if (circle) {
        circle.setMap(null)
      }
    }
  }, [circle])

  useEffect(() => {
    if (circle) {
      circle.setOptions({
        ...options,
        center,
        radius,
        map: options.map,
      })
    }
  }, [circle, center, radius, options])

  return null
}

export default EventsPage
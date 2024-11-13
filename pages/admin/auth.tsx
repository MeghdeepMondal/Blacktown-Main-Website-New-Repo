import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Upload } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px'
}

const center = {
  lat: -33.7688,
  lng: 150.9051
}

const AdminAuth: React.FC = () => {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    description: '',
    address: '',
    contactDetails: '',
    lat: center.lat,
    lng: center.lng
  })
  const [markerPosition, setMarkerPosition] = useState(center)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      setFormData(prev => ({ ...prev, lat, lng }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dataToSend = {
      ...formData,
      isLogin
    }

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      })
      const data = await response.json()
      
      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('adminToken', data.token)
          if (data.adminId) {
            router.push(`/admin/dashboard/${data.adminId}`)
          } else {
            console.error('Admin ID not received from server')
            alert('Error: Admin ID not received. Please try again.')
          }
        } else {
          alert(data.message)
          setIsLogin(true) // Switch to login view after successful signup
        }
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error during authentication:', error)
      alert('An error occurred during authentication')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{isLogin ? 'Admin Login' : 'Admin Signup'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {isLoaded && (
                  <div className="space-y-2">
                    <Label>Location</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactDetails">Contact Details</Label>
                  <Input
                    id="contactDetails"
                    placeholder="Contact Details"
                    name="contactDetails"
                    value={formData.contactDetails}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full">
              {isLogin ? 'Login' : 'Signup'}
            </Button>
          </form>
          
          <p className="mt-4 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Signup' : 'Login'}
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminAuth
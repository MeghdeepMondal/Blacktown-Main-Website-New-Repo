import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Upload, LogOut } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const validEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com'];

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1];
  return validEmailDomains.includes(domain);
};

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
  const [emailError, setEmailError] = useState('');
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
    e.preventDefault();
    
    if (!isLogin && !isValidEmailDomain(formData.email)) {
      alert('Please use a valid email domain.');
      return;
    }

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <header className="bg-black text-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <h1 className="ml-4 text-2xl font-bold">One Heart Blacktown</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500 transition-colors duration-300">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-pink-300 text-pink-800 rounded-t-lg">
            <CardTitle>{isLogin ? 'Admin Login' : 'Admin Signup'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-pink-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleInputChange(e);
                    setEmailError('');
                  }}
                  onBlur={(e) => {
                    if (!isLogin && !isValidEmailDomain(e.target.value)) {
                      setEmailError('Please use a valid email domain.');
                    }
                  }}
                  required
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>
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
              {!isLogin && (
                <>
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
                </>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isLogin ? 'Login' : 'Signup'}
              </Button>
            </form>
            
            <p className="mt-4 text-center text-pink-800">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-600 hover:text-pink-700"
              >
                {isLogin ? 'Signup' : 'Login'}
              </Button>
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 One Heart Blacktown. All rights reserved.</p>
          <div className="mt-4 flex justify-center items-center">
            <MapPin className="mr-2" />
            <span>Wotso, Westpoint Shopping Centre, Level 4, Shop 4023/17 Patrick St, Blacktown NSW 2148 , Blacktown, NSW, Australia, 2148</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AdminAuth
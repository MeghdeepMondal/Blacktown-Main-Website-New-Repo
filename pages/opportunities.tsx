import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Search, X, ExternalLink } from 'lucide-react'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface Opportunity {
  id: string
  name: string
  date: string
  location: string
  description: string
  opportunity: string
  photo?: string
  registrationLink?: string
}

const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/opportunities')
        if (!response.ok) {
          throw new Error('Failed to fetch opportunities')
        }
        const data = await response.json()
        setOpportunities(data)
        setFilteredOpportunities(data)
      } catch (error) {
        console.error('Error fetching opportunities:', error)
        setError('Failed to load opportunities. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOpportunities(opportunities)
    } else {
      const filtered = opportunities.filter(
        (opportunity) =>
          opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opportunity.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opportunity.opportunity.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOpportunities(filtered)
    }
  }, [searchTerm, opportunities])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-white to-pink-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-pink-800 mb-4">
            Volunteer Opportunities
          </h1>
          <p className="text-lg md:text-xl text-pink-600 max-w-2xl mx-auto">
            Join us in making a difference in our community. Find volunteer opportunities that match your skills and interests.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2 border-2 border-pink-200 focus:border-pink-400 rounded-full"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No volunteer opportunities found.</p>
            {searchTerm && (
              <p className="text-gray-500 mt-2">
                Try adjusting your search or check back later for new opportunities.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card
                key={opportunity.id}
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 overflow-hidden flex flex-col"
              >
                {opportunity.photo ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={opportunity.photo || "/placeholder.svg"}
                      alt={opportunity.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-pink-200 to-pink-300 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{opportunity.name}</h3>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-pink-800">{opportunity.name}</CardTitle>
                  <CardDescription className="flex items-center text-pink-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(opportunity.date)}
                  </CardDescription>
                  <CardDescription className="flex items-center text-pink-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {opportunity.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-3">
                    <h4 className="font-medium text-green-800 mb-1">Volunteer Opportunity</h4>
                    <p className="text-green-700">{opportunity.opportunity}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-center">
                  <Button
                    onClick={() => router.push(`/events/${opportunity.id}`)}
                    variant="outline"
                    className="text-pink-600 border-pink-200 hover:bg-pink-50"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default OpportunitiesPage
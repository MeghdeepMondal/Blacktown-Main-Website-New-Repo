import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Search, Filter, Users, ExternalLink } from 'lucide-react'
import Footer from '@/components/footer'
import Header from '@/components/header'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Admin {
  id: string
  name: string
}

interface Opportunity {
  id: string
  name: string
  description: string
  date: string
  location: string
  photo?: string
  registrationLink?: string
  opportunity: string
  adminId: string
  admin: Admin
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [organizationFilter, setOrganizationFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [organizations, setOrganizations] = useState<Admin[]>([])

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities')
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }
      const data = await response.json()
      setOpportunities(data.opportunities)
      setFilteredOpportunities(data.opportunities)
      
      // Extract unique organizations for filter
      const uniqueOrgs = Array.from(
        new Set(data.opportunities.map((opp: Opportunity) => opp.admin.id))
      ).map(id => {
        const opp = data.opportunities.find((o: Opportunity) => o.admin.id === id)
        return opp.admin
      })
      
      setOrganizations(uniqueOrgs)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      setError('Failed to load opportunities. Please try again later.')
      setLoading(false)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [searchTerm, organizationFilter, dateFilter, opportunities])

  const applyFilters = () => {
    let filtered = [...opportunities]
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        opp => 
          opp.name.toLowerCase().includes(term) || 
          opp.description.toLowerCase().includes(term) || 
          opp.opportunity.toLowerCase().includes(term) ||
          opp.admin.name.toLowerCase().includes(term)
      )
    }
    
    // Apply organization filter
    if (organizationFilter) {
      filtered = filtered.filter(opp => opp.admin.id === organizationFilter)
    }
    
    // Apply date filter
    if (dateFilter) {
      const today = new Date()
      const oneWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const oneMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      filtered = filtered.filter(opp => {
        const eventDate = new Date(opp.date)
        
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
    
    setFilteredOpportunities(filtered)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setOrganizationFilter('')
    setDateFilter('')
    setFilteredOpportunities(opportunities)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pink-600 mb-4">Volunteer Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in making a difference in the Blacktown community. Find volunteer opportunities 
            with local churches and organizations.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="mb-2">Search Opportunities</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by keyword..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <Label htmlFor="organization" className="mb-2">Organization</Label>
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger id="organization">
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
            
            <div className="w-full md:w-64">
              <Label htmlFor="date" className="mb-2">Date</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Any Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="upcoming">All Upcoming</SelectItem>
                  <SelectItem value="past">Past Opportunities</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="h-10"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Results Section */}
        {filteredOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={opportunity.photo || "/placeholder.svg?height=300&width=400"}
                    alt={opportunity.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Volunteer
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{opportunity.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(opportunity.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-1 text-gray-500 shrink-0" />
                    <span className="text-gray-600">{opportunity.location}</span>
                  </div>
                  <div className="mb-3 flex items-start">
                    <Users className="h-4 w-4 mr-1 mt-1 text-gray-500 shrink-0" />
                    <span className="text-gray-600">{opportunity.admin.name}</span>
                  </div>
                  <div 
                    className="text-gray-700 line-clamp-3 prose prose-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: opportunity.opportunity.substring(0, 150) + (opportunity.opportunity.length > 150 ? '...' : '') 
                    }}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/events/${opportunity.id}`} passHref>
                    <Button className="bg-pink-400 hover:bg-pink-600" variant="default">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={resetFilters}>Reset Filters</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
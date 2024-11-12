import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'

type AdminRequest = {
  id: string
  email: string
  name: string
  description: string
  address: string
  contactDetails: string
  status: 'pending' | 'approved' | 'rejected'
}

type Admin = {
  id: string
  email: string
  name: string
  description: string
  address: string
  contactDetails: string
}

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([])
  const [existingAdmins, setExistingAdmins] = useState<Admin[]>([])

  useEffect(() => {
    fetchAdminRequests()
    fetchExistingAdmins()
  }, [])

  const fetchAdminRequests = async () => {
    try {
      const response = await fetch('/api/superadmin/adminrequests')
      if (!response.ok) throw new Error('Failed to fetch admin requests')
      const data = await response.json()
      setAdminRequests(data)
    } catch (error) {
      console.error('Error fetching admin requests:', error)
    }
  }

  const fetchExistingAdmins = async () => {
    try {
      const response = await fetch('/api/superadmin/admins')
      if (!response.ok) throw new Error('Failed to fetch existing admins')
      const data = await response.json()
      setExistingAdmins(data)
    } catch (error) {
      console.error('Error fetching existing admins:', error)
    }
  }

  const handleRequestAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/superadmin/adminrequests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!response.ok) throw new Error(`Failed to ${action} admin request`)
      fetchAdminRequests()
      if (action === 'approve') fetchExistingAdmins()
    } catch (error) {
      console.error(`Error ${action}ing admin request:`, error)
    }
  }

  return (
    <div>
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
                <Link href="/" className="text-white hover:text-pink-500">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/opportunities"
                  className="text-white hover:text-pink-500"
                >
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-pink-500">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-white hover:text-pink-500">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-pink-500">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-pink-500"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Signup Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.description}</TableCell>
                  <TableCell>{request.address}</TableCell>
                  <TableCell>{request.contactDetails}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleRequestAction(request.id, 'approve')}
                      className="mr-2 bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRequestAction(request.id, 'reject')}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Admins</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {existingAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.description}</TableCell>
                  <TableCell>{admin.address}</TableCell>
                  <TableCell>{admin.contactDetails}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
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

export default SuperAdminDashboard
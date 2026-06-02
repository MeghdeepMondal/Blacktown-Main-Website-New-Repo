import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ExternalLink, MapPin, User, Building2 } from 'lucide-react'
import Layout from '@/components/Layout'

interface AdminMember {
  id: string
  name: string
  logo?: string | null
  bannerPhoto?: string | null
  address?: string | null
  websiteLink?: string | null
  description?: string | null
}

import { MongoClient } from 'mongodb'

export async function getServerSideProps() {
  try {
    const client = new MongoClient(process.env.DATABASE_URL as string)
    await client.connect()
    const db = client.db()
    
    // Fetch directly from MongoDB to bypass Prisma's strict type checking
    const admins = await db.collection("admins").find({}).toArray()
    await client.close()

    // Safely map data, ignoring any corrupted Binary fields
    const formattedAdmins = admins.map(admin => ({
      id: admin._id.toString(),
      name: admin.name || "Unknown Organization",
      logo: typeof admin.logo === 'string' ? admin.logo : null,
      bannerPhoto: typeof admin.bannerPhoto === 'string' ? admin.bannerPhoto : null,
      address: admin.address || null,
      websiteLink: admin.websiteLink || null,
      description: admin.description || null,
    }))
    
    return {
      props: {
        members: formattedAdmins
      }
    }
  } catch (error) {
    console.error("Error fetching members:", error)
    return {
      props: {
        members: []
      }
    }
  }
}

export default function MembersPage({ members = [] }: { members?: AdminMember[] }) {
  console.log("Members component rendering with members:", members.length);
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Layout>

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Our Members</h1>
          <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-pink-700">
            Get to know the organizations that make up One Heart Blacktown. Together, we&apos;re working to make our community stronger.
          </p>

          <div className="space-y-12">
            {members.map((member) => (
              <Card key={member.id} className="relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400">
                  {member.bannerPhoto ? (
                    <Image
                      src={member.bannerPhoto}
                      alt={`${member.name} banner`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Gradient overlay for better text contrast if we had text on the banner */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <CardContent className="relative p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-32 h-32 relative flex-shrink-0 bg-pink-50 rounded-full shadow-md overflow-hidden -mt-16 border-4 border-white flex items-center justify-center">
                    {member.logo ? (
                      <Image
                        src={member.logo}
                        alt={`${member.name} logo`}
                        fill
                        className="object-contain bg-white"
                      />
                    ) : (
                      <Building2 className="w-12 h-12 text-pink-300" />
                    )}
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-semibold mb-2 text-pink-800">{member.name}</h2>
                    
                    {member.address && (
                      <p className="flex items-center justify-center md:justify-start text-gray-600 mb-4">
                        <MapPin className="w-5 h-5 mr-2 text-pink-500 flex-shrink-0" />
                        <span>{member.address}</span>
                      </p>
                    )}
                    
                    {member.description && (
                      <p className="text-gray-700">{member.description}</p>
                    )}
                  </div>
                </CardContent>
                
                {member.websiteLink && (
                  <CardFooter className="relative bg-gray-50/80 p-4 flex justify-center md:justify-end border-t border-gray-100">
                    <Button
                      variant="default"
                      className="bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-300 shadow-sm hover:shadow-md"
                      onClick={() => window.open(member.websiteLink || '', '_blank')}
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </main>
      </Layout>
    </div>
  )
}
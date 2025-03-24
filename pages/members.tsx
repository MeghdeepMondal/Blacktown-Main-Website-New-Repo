import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ExternalLink, MapPin } from 'lucide-react'
import Layout from '@/components/Layout'

// Mock data for members
const members = [
  {
    id: 1,
    name: "St. Patrick's Church",
    logo: "/church1.jpg?height=100&width=100",
    banner: "/cbanner1.jpg?height=200&width=800",
    address: "51-59 Allawah St, Blacktown NSW 2148",
    website: "https://stpatricksblacktown.org.au/",
    description: "St. Patrick's Church is a vibrant Catholic community dedicated to serving the spiritual needs of Blacktown residents since 1861."
  },
  {
    id: 2,
    name: "Blacktown Anglican Church",
    logo: "/church2.jpg?height=100&width=100",
    banner: "/cbanner2.jpg?height=200&width=800",
    address: "19 Kildare Rd, Blacktown NSW 2148",
    website: "https://www.blacktownanglican.org.au/",
    description: "Blacktown Anglican Church is committed to sharing God's love through worship, fellowship, and community outreach programs."
  },
  {
    id: 3,
    name: "Blacktown Uniting Church",
    logo: "/church3.jpg?height=100&width=100",
    banner: "/cbanner3.jpg?height=200&width=800",
    address: "13 Kildare Rd, Blacktown NSW 2148",
    website: "https://blacktownuniting.org.au/",
    description: "Blacktown Uniting Church is an inclusive community fostering faith, social justice, and compassion in the heart of Blacktown."
  },
  {
    id: 4,
    name: "Blacktown Baptist Church",
    logo: "/church4.jpg?height=100&width=100",
    banner: "/cbanner4.jpg?height=200&width=800",
    address: "25 Main St, Blacktown NSW 2148",
    website: "https://www.blacktownbaptist.org.au/",
    description: "Blacktown Baptist Church is dedicated to spreading the Gospel and supporting families through various ministries and community services."
  },
  {
    id: 5,
    name: "Blacktown Community Services",
    logo: "/church5.jpg?height=100&width=100",
    banner: "/cbanner5.jpg?height=200&width=800",
    address: "45 Flushcombe Rd, Blacktown NSW 2148",
    website: "https://www.blacktowncommunityservices.org/",
    description: "Blacktown Community Services provides essential support to local residents, offering counseling, financial assistance, and youth programs."
  },
  {
    id: 6,
    name: "Blacktown Youth Services",
    logo: "/church6.jpg?height=100&width=100",
    banner: "/cbanner6.jpg?height=200&width=800",
    address: "32 Patrick St, Blacktown NSW 2148",
    website: "https://www.blacktownyouth.org/",
    description: "Blacktown Youth Services is dedicated to empowering young people through education, mentorship, and recreational activities."
  }
]

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-100">
      <Layout>

        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Our Members</h1>
          <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-pink-700">
            Get to know the organizations that make up One Heart Blacktown. Together, we&apos;re working to make our community stronger.
          </p>

          <div className="space-y-12">
            {members.map((member, index) => (
              <Card key={member.id} className="relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <Image
                    src={member.banner}
                    alt={`${member.name} banner`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="relative p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-32 h-32 relative flex-shrink-0 bg-white rounded-full shadow-md overflow-hidden -mt-16 border-4 border-white">
                    <Image
                      src={member.logo}
                      alt={`${member.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="text-2xl font-semibold mb-2 text-pink-800">{member.name}</h2>
                    <p className="flex items-center justify-center md:justify-start text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2 text-pink-500" />
                      {member.address}
                    </p>
                    <p className="text-gray-700">{member.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="relative bg-gray-100 p-4 flex justify-center md:justify-end">
                  <Button
                    variant="default"
                    className="bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-300 shadow-md hover:shadow-lg"
                    onClick={() => window.open(member.website, '_blank')}
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </Layout>
    </div>
  )
}
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ExternalLink, MapPin } from 'lucide-react'

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
      <header className="bg-black text-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/One Heart.png"
              alt="One Heart Blacktown Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <h1 className="ml-4 text-2xl font-bold">One Heart Blacktown</h1>
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-white hover:text-pink-500 transition-colors duration-300">
                  Members
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

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-pink-800">Our Members</h1>
        <p className="text-lg text-center mb-12 max-w-2xl mx-auto text-pink-700">
          Get to know the organizations that make up One Heart Blacktown. Together, we're working to make our community stronger.
        </p>

        <div className="space-y-12">
          {members.map((member, index) => (
            <Card key={member.id} className="relative overflow-hidden bg-gradient-to-br from-pink-100 to-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-48 md:h-64 overflow-hidden">
                <Image
                  src={member.banner}
                  alt={`${member.name} banner`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500 to-transparent opacity-50"></div>
              </div>
              <div className="absolute inset-0 bg-pink-200 opacity-20" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff69b4' fill-opacity='0.15'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}></div>
              <div className={`absolute ${index % 2 === 0 ? 'top-0 right-0' : 'bottom-0 left-0'} w-24 h-24 bg-pink-500 opacity-20 transform rotate-45 translate-x-12 -translate-y-12`}></div>
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
              <CardFooter className="relative bg-gradient-to-r from-pink-200 to-pink-100 p-4 flex justify-center md:justify-end">
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

      <footer className="bg-black text-white py-8 mt-12">
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
import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

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
    
    // Cache the response for 10 seconds locally, revalidate in background
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
    return res.status(200).json({ members: formattedAdmins })
  } catch (error) {
    console.error("Error fetching members API:", error)
    return res.status(500).json({ error: "Failed to fetch members" })
  }
}

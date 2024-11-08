import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next/types'

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Create user
    const user = await prisma.users.create({
      data: {
        email: 'raj@prisma.io',
        name: 'Raj',
        password: '123456',
      },
    });

    const users = await prisma.users.findMany();
    
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: "Error fetching users", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
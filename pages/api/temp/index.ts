import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next/types'

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = await prisma.user.findMany()
  res.status(200).json(users)
}
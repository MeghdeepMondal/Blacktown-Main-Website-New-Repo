import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { username, otp } = req.body

  if (!username || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' })
  }

  const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL
  if (username !== SUPERADMIN_EMAIL) {
    return res.status(400).json({ message: 'Invalid email' })
  }

  try {
    const otpRecord = await prisma.passwordresetotp.findUnique({
      where: { email: 'superadmin' }
    })

    if (!otpRecord) {
      return res.status(400).json({ message: 'No pending reset request found or OTP expired.' })
    }

    if (new Date() > otpRecord.expiresAt) {
      // Clean up expired OTP
      await prisma.passwordresetotp.delete({ where: { email: 'superadmin' } })
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp)

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    // Success - keep the OTP record since we'll verify it again on the final reset step
    return res.status(200).json({ verified: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ message: 'Failed to verify OTP. Please try again.' })
  }
}

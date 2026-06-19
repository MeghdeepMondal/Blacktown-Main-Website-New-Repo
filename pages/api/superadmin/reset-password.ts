import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { username, otp, newPassword } = req.body

  if (!username || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required' })
  }

  const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL
  if (username !== SUPERADMIN_EMAIL) {
    return res.status(400).json({ message: 'Invalid email' })
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' })
  }

  try {
    // 1. Verify OTP again (to ensure security)
    const otpRecord = await prisma.passwordresetotp.findUnique({
      where: { email: 'superadmin' }
    })

    if (!otpRecord) {
      return res.status(400).json({ message: 'Reset session expired. Please start over.' })
    }

    if (new Date() > otpRecord.expiresAt) {
      await prisma.passwordresetotp.delete({ where: { email: 'superadmin' } })
      return res.status(400).json({ message: 'OTP has expired. Please start over.' })
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otp)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }

    // 2. Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 3. Update or create the superadminconfig document to store the new overridden hash
    await prisma.superadminconfig.upsert({
      where: { email: 'superadmin' },
      update: { passwordHash: hashedNewPassword },
      create: { email: 'superadmin', passwordHash: hashedNewPassword }
    })

    // 4. Delete the OTP record so it can't be reused
    await prisma.passwordresetotp.delete({ where: { email: 'superadmin' } })

    return res.status(200).json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ message: 'Failed to reset password. Please try again.' })
  }
}
